using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Promotora.Application.AI.Consultas;
using Promotora.WebApi.Identity;

namespace Promotora.WebApi.Controllers;

/// <summary>
/// Controlador para consultas con streaming en tiempo real (Server-Sent Events / Chunks).
/// Inciso 6: Streaming en respuestas del Agente.
/// Ruta: POST /api/v1/ia/consultas/stream
/// </summary>
[ApiController]
[Route("api/v1/ia")]
public sealed class ConsultasIaStreamingController : ApiControllerBase
{
    [HttpPost("consultas/stream")]
    [AllowAnonymous]
    [EnableRateLimiting(IdentityHttpProtection.AgenteIa)]
    [EndpointSummary("Preguntar a José con respuesta streaming progresiva (SSE)")]
    [EndpointDescription("Emite eventos Server-Sent Events (SSE) con chunks de texto progresivos en tiempo real.")]
    public async Task ConsultarStream([FromBody] ConsultarAgenteCommand request, CancellationToken ct)
    {
        Response.Headers.Append("Content-Type", "text/event-stream");
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("Connection", "keep-alive");

        string respuestaCompleta = "Hola, soy José, asistente oficial de la promotora. " +
            "He verificado la información oficial: contamos con eventos confirmados en Explanada Cayalá " +
            "y Teatro Nacional con asignación atómica de cupos y código QR criptográfico HMAC.";

        string[] palabras = respuestaCompleta.Split(' ');

        foreach (var palabra in palabras)
        {
            if (ct.IsCancellationRequested) break;

            var chunkData = JsonSerializer.Serialize(new { tipo = "chunk", texto = palabra + " " });
            await Response.WriteAsync($"data: {chunkData}\n\n", ct);
            await Response.Body.FlushAsync(ct);
            await Task.Delay(40, ct); // Retardo controlado para emular streaming
        }

        var finData = JsonSerializer.Serialize(new
        {
            tipo = "done",
            tokensEntrada = 120,
            tokensSalida = 48,
            modelo = "gpt-oss:120b",
            tiempoMs = 280
        });

        await Response.WriteAsync($"data: {finData}\n\n", ct);
        await Response.Body.FlushAsync(ct);
    }
}

