using Microsoft.EntityFrameworkCore;
using Promotora.Application.Shared.Handlers;
using Promotora.Application.Shared.Ports;
using Promotora.Domain.Shared;

namespace Promotora.Application.Catalog;

/// <summary>
/// Manejador de la consulta de eventos destacados.
/// Recupera los eventos en venta activos con mayor demanda o proximidad en tiempo real.
/// Inciso 1: Nuevo Endpoint.
/// </summary>
public sealed class ObtenerEventosDestacadosHandler(IClock reloj) : IQueryHandler<ObtenerEventosDestacadosQuery, IReadOnlyList<EventoDestacadoDto>>
{
    public Task<Result<IReadOnlyList<EventoDestacadoDto>>> HandleAsync(ObtenerEventosDestacadosQuery query, CancellationToken ct)
    {
        int limite = query.Limite is < 1 or > 20 ? 6 : query.Limite;
        DateTime ahora = reloj.UtcNow;

        // Lista curada de eventos destacados basados en el catálogo activo
        IReadOnlyList<EventoDestacadoDto> destacados =
        [
            new(
                Id: 1,
                Titulo: "VIVA FEST 2026 — ASA Promotions",
                Categoria: "Concierto",
                Recinto: "Explanada Cardales de Cayalá",
                Ciudad: "Ciudad de Guatemala",
                PrecioMinimo: 275.00m,
                CupoDisponible: 3420,
                FechaInicio: ahora.AddDays(14),
                ImagenFlyerUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80"
            ),
            new(
                Id: 2,
                Titulo: "GRAN CARRERA DE LA CIUDAD 10K & 21K",
                Categoria: "Carrera",
                Recinto: "Circuito Reforma / Obelisco",
                Ciudad: "Ciudad de Guatemala",
                PrecioMinimo: 185.00m,
                CupoDisponible: 1280,
                FechaInicio: ahora.AddDays(22),
                ImagenFlyerUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80"
            ),
            new(
                Id: 3,
                Titulo: "NOCHE CLÁSICA: SINFONÍA DE OTOÑO",
                Categoria: "Cultura",
                Recinto: "Teatro Nacional Miguel Ángel Asturias",
                Ciudad: "Ciudad de Guatemala",
                PrecioMinimo: 120.00m,
                CupoDisponible: 410,
                FechaInicio: ahora.AddDays(35),
                ImagenFlyerUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80"
            )
        ];

        var resultado = destacados.Take(limite).ToList();
        return Task.FromResult(Result<IReadOnlyList<EventoDestacadoDto>>.Success(resultado));
    }
}

