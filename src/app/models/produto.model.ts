export interface Produto {
  id: number;
  categoria: string;
  nome: string;
  custoAVista: number;
  custoAPrazo: number;
}

export interface CalculoPrecificacaoRequest {
  produtoId: number;
  percentualAumento: number;
  percentualDesconto: number;
  usarPrecoAVista: boolean;
}

export interface CalculoPrecificacaoResponse {
  produto: Produto;
  custoBase: number;
  percentualAumento: number;
  percentualDesconto: number;
  precoVendaSemDesconto: number;
  precoVendaComDesconto: number;
  valorDesconto: number;
  margemLucro: number;
  lucroEmReais: number;
  tipoPreco: string;
}