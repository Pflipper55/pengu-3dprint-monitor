import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html'
})
export class App {
  primaryColor = '#00A676';
  secondaryColor = '#222222';
  
  message = signal('Klicke auf den Button, um das Theme zu testen!');
  
  onButtonClick() {
    this.message.set('🎉 Perfekt! Deine Custom theme.ts greift fehlerfrei.');
  }
}
