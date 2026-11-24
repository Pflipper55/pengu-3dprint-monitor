import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Service, signal } from '@angular/core';
import { environment } from '../environments/environment';
import { PrinterStatusUpdate } from '../models/printer/printer-status-update';

@Service()
export class PrinterStatusService {
  public readonly statuses = signal<Record<string, PrinterStatusUpdate['status']>>({});

  private readonly connection: HubConnection = new HubConnectionBuilder()
    .withUrl(`${environment.apiUrl}/hubs/printer-status`)
    .withAutomaticReconnect()
    .build();
  private readonly versions: Record<string, number> = {};
  private shouldConnect = false;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.connection.on('PrinterStatusChanged', (update: PrinterStatusUpdate) => {
      this.applyStatus(update);
    });
    this.connection.on('PrinterRemoved', (printerId: string) => {
      delete this.versions[printerId];
      this.statuses.update((statuses) => {
        const remainingStatuses = { ...statuses };
        delete remainingStatuses[printerId];
        return remainingStatuses;
      });
    });
    this.connection.onreconnecting(() => this.clearStatuses());
    this.connection.onreconnected(() => void this.refreshStatuses());
    this.connection.onclose((error) => {
      this.clearStatuses();
      if (error) {
        console.error('Printer status WebSocket closed.', error);
      }

      this.scheduleReconnect();
    });
  }

  public connect(): void {
    this.shouldConnect = true;
    if (this.connection.state === HubConnectionState.Connected) {
      void this.refreshStatuses();
      return;
    }

    if (this.connection.state !== HubConnectionState.Disconnected) {
      return;
    }

    void this.connection
      .start()
      .then(() => this.refreshStatuses())
      .catch((error: unknown) => {
        console.error('Could not connect to printer status WebSocket.', error);
        this.scheduleReconnect();
      });
  }

  public disconnect(): void {
    this.shouldConnect = false;
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    this.clearStatuses();
    if (this.connection.state !== HubConnectionState.Disconnected) {
      void this.connection.stop().catch((error: unknown) => {
        console.error('Could not stop printer status WebSocket.', error);
      });
    }
  }

  private async refreshStatuses(): Promise<void> {
    try {
      const updates = await this.connection.invoke<PrinterStatusUpdate[]>('GetCurrentStatuses');
      updates.forEach((update) => this.applyStatus(update));
    } catch (error) {
      console.error('Could not load current printer statuses.', error);
    }
  }

  private applyStatus(update: PrinterStatusUpdate): void {
    if (update.version < (this.versions[update.id] ?? -1)) {
      return;
    }

    this.versions[update.id] = update.version;
    this.statuses.update((statuses) => ({ ...statuses, [update.id]: update.status }));
  }

  private clearStatuses(): void {
    for (const printerId of Object.keys(this.versions)) {
      delete this.versions[printerId];
    }
    this.statuses.set({});
  }

  private scheduleReconnect(): void {
    if (!this.shouldConnect || this.retryTimer !== null) {
      return;
    }

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.connect();
    }, 5000);
  }
}
