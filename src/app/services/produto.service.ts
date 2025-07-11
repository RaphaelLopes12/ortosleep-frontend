import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto, CalculoPrecificacaoRequest, CalculoPrecificacaoResponse } from '../models/produto.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private apiUrl = `${environment.apiUrl}/api/produtos`;

  constructor(private http: HttpClient) { }

  buscarProdutos(busca?: string): Observable<Produto[]> {
    const url = busca ? `${this.apiUrl}?busca=${encodeURIComponent(busca)}` : this.apiUrl;
    return this.http.get<Produto[]>(url);
  }

  calcularPrecificacao(request: CalculoPrecificacaoRequest): Observable<CalculoPrecificacaoResponse> {
    return this.http.post<CalculoPrecificacaoResponse>(`${this.apiUrl}/calcular-precificacao`, request);
  }
}