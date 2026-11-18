using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Promotora.Application.Catalog;
using Promotora.Application.Shared.Handlers;

namespace Promotora.WebApi.Controllers;

/// <summary>
/// Controlador de la API para consulta de eventos destacados en la cartelera.
/// Inciso 1: Nuevo Endpoint.
/// Ruta: GET /api/v1/catalogo/destacados
/// </summary>
[ApiController]
[Route("api/v1/catalogo")]
public sealed class CatalogoDestacadosController(
    IQueryHandler<ObtenerEventosDestacadosQuery, IReadOnlyList<EventoDestacadoDto>> handler) : ApiControllerBase
{
    [HttpGet("destacados")]
    [AllowAnonymous]
    [EndpointSummary("Obtener eventos destacados de la cartelera oficial")]
    [EndpointDescription("Retorna la lista de eventos activos con mayor demanda en cartelera, incluyendo precio mínimo y cupo en tiempo real.")]
    [ProducesResponseType<IReadOnlyList<EventoDestacadoDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<EventoDestacadoDto>>> ListarDestacados(
        [FromQuery] int limite = 6,
        CancellationToken ct = default)
    {
        var resultado = await handler.HandleAsync(new ObtenerEventosDestacadosQuery(limite), ct);
        return FromResult(resultado);
    }
}

