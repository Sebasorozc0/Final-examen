namespace Promotora.Application.Catalog;

/// <summary>
/// DTO de respuesta para el endpoint de eventos destacados en cartelera.
/// Inciso 1: Nuevo Endpoint.
/// </summary>
public sealed record EventoDestacadoDto(
    int Id,
    string Titulo,
    string Categoria,
    string Recinto,
    string Ciudad,
    decimal PrecioMinimo,
    int CupoDisponible,
    DateTime FechaInicio,
    string? ImagenFlyerUrl);

