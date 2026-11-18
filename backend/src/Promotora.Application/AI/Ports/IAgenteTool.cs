using Promotora.Application.AI.Rag;

namespace Promotora.Application.AI.Ports;

/// <summary>
/// Definicion de una herramienta (Tool) invocable por el Agente de IA.
/// Permite al agente ejecutar logica de negocio y consultar la base de datos real.
/// Inciso 2: Nueva Tool para el Agente.
/// </summary>
public interface IAgenteTool
{
    string Nombre { get; }
    string Descripcion { get; }
    bool PuedeManejar(string pregunta);
    Task<FuenteContexto?> EjecutarAsync(string pregunta, CancellationToken ct);
}

