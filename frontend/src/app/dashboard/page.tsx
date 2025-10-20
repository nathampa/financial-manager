// frontend/src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import api, { Account, DashboardData } from '@/lib/api';
import { Wallet, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashResponse, accountsResponse] = await Promise.all([
        api.get('/transactions/dashboard/'),
        api.get('/accounts/'),
      ]);

      setDashboardData(dashResponse.data);
      setAccounts(accountsResponse.data.results || accountsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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

  const getAccountColor = (type: string) => {
    const colors: { [key: string]: string } = {
      CHECKING: 'bg-purple-500',
      SAVINGS: 'bg-blue-500',
      CREDIT_CARD: 'bg-orange-500',
      CASH: 'bg-green-500',
      INVESTMENT: 'bg-indigo-500',
    };
    return colors[type] || 'bg-gray-500';
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral das suas finanças</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-semibold">Saldo Total</h3>
            <Wallet className="text-blue-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(dashboardData?.total_balance || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-2">Todas as contas</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-semibold">Receitas</h3>
            <TrendingUp className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(dashboardData?.month_income || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-2">Este mês</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-semibold">Despesas</h3>
            <TrendingDown className="text-red-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(dashboardData?.month_expense || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-2">Este mês</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Minhas Contas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Minhas Contas</h2>
          {accounts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma conta cadastrada
            </p>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 ${getAccountColor(
                        account.type
                      )} rounded-full flex items-center justify-center`}
                    >
                      <CreditCard className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {account.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {account.type_display}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold text-lg ${
                      account.current_balance >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(account.current_balance)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Despesas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Maiores Despesas
          </h2>
          {!dashboardData?.top_expenses ||
          dashboardData.top_expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma despesa registrada
            </p>
          ) : (
            <div className="space-y-4">
              {dashboardData.top_expenses.map((expense, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{expense.category__icon}</span>
                      <span className="text-gray-700 font-medium">
                        {expense.category__name}
                      </span>
                    </div>
                    <span className="text-gray-800 font-bold">
                      {formatCurrency(expense.total)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {expense.count} transações
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}