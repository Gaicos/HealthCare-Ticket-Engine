using System.Reflection;
using System.Text.Json.Serialization;
using HealthCare_Ticket_Engine.Middlewares;
using HealthCare_Ticket_Engine.Repositories;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddScoped<IIncidentRepository, InMemoryIncidentRepository>();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "HealthCare Ticket Engine API",
        Version = "v1",
        Description = "API RESTful em ASP.NET Core .NET 8 para gestão, triagem N2 e controle de SLA de incidentes hospitalares e de saúde (Crítica: 1h, Alta: 4h, Média: 8h, Baixa: 24h).",
        Contact = new OpenApiContact
        {
            Name = "João (Gaicos)",
            Url = new Uri("https://github.com/Gaicos")
        }
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

app.UseExceptionHandler();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "HealthCare Ticket Engine API v1");
    options.RoutePrefix = "swagger";
});

app.UseDefaultFiles();
app.UseStaticFiles();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

app.MapControllers();

app.Run();
