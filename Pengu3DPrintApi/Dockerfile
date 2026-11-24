FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# copy csproj and restore first for better caching
COPY ["Pengu3DPrintApi/Pengu3DPrintApi.csproj", "Pengu3DPrintApi/"]
COPY ["BambuSharp-Pengu-Fork/Source/BambuSharp/BambuSharp.csproj", "BambuSharp-Pengu-Fork/Source/BambuSharp/"]
COPY ["BambuSharp-Pengu-Fork/LICENSE", "BambuSharp-Pengu-Fork/"]
COPY ["BambuSharp-Pengu-Fork/README.md", "BambuSharp-Pengu-Fork/"]
COPY ["BambuSharp-Pengu-Fork/Source/BambuSharp/icon.png", "BambuSharp-Pengu-Fork/Source/BambuSharp/"]
RUN dotnet restore "Pengu3DPrintApi/Pengu3DPrintApi.csproj"

# copy the rest and publish
COPY . .
WORKDIR /src/Pengu3DPrintApi
RUN dotnet publish "Pengu3DPrintApi.csproj" -c Release --no-restore -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5066
ENTRYPOINT ["dotnet", "Pengu3DPrintApi.dll"]
