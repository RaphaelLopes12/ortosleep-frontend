import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProdutoService } from '../../services/produto.service';
import { Produto, CalculoPrecificacaoResponse } from '../../models/produto.model';

@Component({
  selector: 'app-precificacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './precificacao.component.html',
  styleUrls: ['./precificacao.component.scss']
})
export class PrecificacaoComponent implements OnInit {
  precificacaoForm: FormGroup;
  produtos: Produto[] = [];
  produtosFiltrados: Observable<Produto[]>;
  resultadoCalculo: CalculoPrecificacaoResponse | null = null;
  produtoSelecionado: Produto | null = null;
  carregando = false;
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService
  ) {
    this.precificacaoForm = this.fb.group({
      buscarProduto: ['', Validators.required],
      produtoId: ['', Validators.required],
      percentualAumento: [50, [Validators.required, Validators.min(0), Validators.max(1000)]],
      percentualDesconto: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      usarPrecoAVista: [true]
    });

    this.produtosFiltrados = this.precificacaoForm.get('buscarProduto')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.filtrarProdutos(value || ''))
    );
  }

  ngOnInit(): void {
    this.carregarProdutos();
    this.setupFormListeners();
  }

  carregarProdutos(): void {
    this.produtoService.buscarProdutos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
      }
    });
  }

  private filtrarProdutos(valor: string): Observable<Produto[]> {
    if (!valor || valor.length < 2) {
      return new Observable(observer => observer.next(this.produtos.slice(0, 10)));
    }
    
    const termoBusca = valor.toLowerCase();
    const resultadosLocais = this.produtos.filter(produto => 
      produto.nome.toLowerCase().includes(termoBusca) ||
      produto.categoria.toLowerCase().includes(termoBusca)
    ).slice(0, 10);

    if (resultadosLocais.length > 0) {
      return new Observable(observer => observer.next(resultadosLocais));
    }

    return this.produtoService.buscarProdutos(valor);
  }

  selecionarProduto(produto: Produto): void {
    this.produtoSelecionado = produto;
    this.precificacaoForm.patchValue({
      buscarProduto: produto.nome,
      produtoId: produto.id
    });
    this.calcularPrecificacao();
  }

  mostrarProduto(produto: Produto): string {
    return produto ? produto.nome : '';
  }

  private setupFormListeners(): void {
    this.precificacaoForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      if (this.precificacaoForm.get('produtoId')?.value) {
        this.calcularPrecificacao();
      }
    });
  }

  calcularPrecificacao(): void {
    if (this.precificacaoForm.invalid) return;

    this.carregando = true;
    const formValue = this.precificacaoForm.value;

    this.produtoService.calcularPrecificacao({
      produtoId: formValue.produtoId,
      percentualAumento: formValue.percentualAumento,
      percentualDesconto: formValue.percentualDesconto,
      usarPrecoAVista: formValue.usarPrecoAVista
    }).subscribe({
      next: (resultado) => {
        this.resultadoCalculo = resultado;
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao calcular precificação:', error);
        this.carregando = false;
      }
    });
  }

  limparFormulario(): void {
    this.precificacaoForm.reset({
      percentualAumento: 50,
      percentualDesconto: 0,
      usarPrecoAVista: true
    });
    this.resultadoCalculo = null;
    this.produtoSelecionado = null;
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  formatarPercentual(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor / 100);
  }
}