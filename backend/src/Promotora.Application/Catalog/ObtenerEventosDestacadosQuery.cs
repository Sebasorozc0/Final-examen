using Promotora.Application.Shared.Handlers;

namespace Promotora.Application.Catalog;

/// <summary>
/// Contrato de consulta para listar los eventos destacados de la cartelera pública.
/// Inciso 1: Nuevo Endpoint.
/// </summary>
public sealed record ObtenerEventosDestacadosQuery(int Limite = 6) : IQuery<IReadOnlyList<EventoDestacadoDto>>;

