// frontend/src/app/dashboard/reports/page.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface MonthlySummary {
  period: { start_date: string; end_date: string };
  income: number;
  expense: number;
  balance: number;
  transactions_count: number;
}

interface MonthlyEvolution {
  month: string;
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [evolution, setEvolution] = useState<MonthlyEvolution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [summaryRes, evolutionRes] = await Promise.all([
        api.get('/transactions/summary/'),
        api.get('/transactions/monthly_evolution/'),
      ]);

      setSummary(summaryRes.data);
      setEvolution(evolutionRes.data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Relatórios</h1>
        <p className="text-gray-600">Análise financeira detalhada</p>
      </div>

      {/* Resumo do período */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-sm font-semibold mb-2 opacity-90">Saldo Total</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(summary?.balance || 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-sm font-semibold mb-2 opacity-90">Receitas</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(summary?.income || 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-sm font-semibold mb-2 opacity-90">Despesas</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(summary?.expense || 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-sm font-semibold mb-2 opacity-90">Transações</h3>
          <p className="text-3xl font-bold">
            {summary?.transactions_count || 0}
          </p>
        </div>
      </div>

      {/* Evolução Mensal */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Evolução Mensal</h2>
        {evolution.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Nenhum dado disponível
          </p>
        ) : (
          <div className="space-y-4">
            {evolution.map((item, index) => (
              <div key={index} className="border-b last:border-0 pb-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-lg">
                    {item.month} {item.year}
                  </span>
                  <div className="flex gap-8">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Receitas</p>
                      <p className="text-green-600 font-bold text-lg">
                        {formatCurrency(item.income)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Despesas</p>
                      <p className="text-red-600 font-bold text-lg">
                        {formatCurrency(item.expense)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Saldo</p>
                      <p
                        className={`font-bold text-lg ${
                          item.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(item.balance)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}