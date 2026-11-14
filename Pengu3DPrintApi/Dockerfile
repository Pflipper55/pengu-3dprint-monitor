FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# copy csproj and restore first for better caching
COPY ["Pengu3DPrintApi.csproj", "./"]
RUN dotnet restore "Pengu3DPrintApi.csproj"

# copy the rest and publish
COPY . .
RUN dotnet publish "Pengu3DPrintApi.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5066
ENTRYPOINT ["dotnet", "Pengu3DPrintApi.dll"]
