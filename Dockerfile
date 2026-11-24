# Stage 1: Build & Publish (.NET 8 SDK)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["HealthCare-Ticket-Engine.csproj", "./"]
RUN dotnet restore "HealthCare-Ticket-Engine.csproj"

COPY . .
RUN dotnet publish "HealthCare-Ticket-Engine.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime (.NET 8 ASP.NET Core)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "HealthCare-Ticket-Engine.dll"]
