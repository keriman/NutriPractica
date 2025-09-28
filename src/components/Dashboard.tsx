import { useState, useEffect } from 'react';
import { Users, FileText, ChefHat, TrendingUp, Plus, Calendar, Activity, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDatabase } from '../lib/database';
import { Patient, ActivityFeed, MonthlyStats } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import logonutri from '../assets/logonutri.png';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState([
    { name: 'Pacientes Activos', value: '0', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { name: 'Documentos', value: '0', icon: FileText, color: 'text-green-600', bgColor: 'bg-green-50' },
    { name: 'Recetas Creadas', value: '0', icon: ChefHat, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { name: 'Consultas Este Mes', value: '0', icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityFeed[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const db = getDatabase();
        const [dashboardStats, recent, activity, monthly] = await Promise.all([
          db.getDashboardStats(),
          db.getRecentPatients(3),
          db.getRecentActivity(8),
          db.getMonthlyStats(6)
        ]);

        setStats([
          { name: 'Pacientes Activos', value: dashboardStats.patients.toString(), icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
          { name: 'Documentos', value: dashboardStats.documents.toString(), icon: FileText, color: 'text-green-600', bgColor: 'bg-green-50' },
          { name: 'Recetas Creadas', value: dashboardStats.recipes.toString(), icon: ChefHat, color: 'text-purple-600', bgColor: 'bg-purple-50' },
          { name: 'Consultas Este Mes', value: dashboardStats.consultationsThisMonth.toString(), icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        ]);
        setRecentPatients(recent);
        setRecentActivity(activity);
        setMonthlyStats(monthly);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Keep default values if API fails
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'patient': return Users;
      case 'consultation': return Calendar;
      case 'recipe': return ChefHat;
      case 'document': return FileText;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'patient': return 'text-blue-600 bg-blue-50';
      case 'consultation': return 'text-green-600 bg-green-50';
      case 'recipe': return 'text-purple-600 bg-purple-50';
      case 'document': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">Resumen de tu práctica nutricional</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onNavigate?.('patients')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </button>
          <button
            onClick={() => onNavigate?.('patients')}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Nueva Consulta
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const getNavigationTab = () => {
            switch (stat.name) {
              case 'Pacientes Activos': return 'patients';
              case 'Recetas Creadas': return 'recipes';
              case 'Documentos': return 'patients';
              default: return 'dashboard';
            }
          };

          return (
            <div
              key={stat.name}
              onClick={() => onNavigate?.(getNavigationTab())}
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly Statistics Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Estadísticas Mensuales</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          {monthlyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="patients" stroke="#3B82F6" strokeWidth={2} name="Pacientes" />
                <Line type="monotone" dataKey="consultations" stroke="#10B981" strokeWidth={2} name="Consultas" />
                <Line type="monotone" dataKey="recipes" stroke="#8B5CF6" strokeWidth={2} name="Recetas" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 text-center py-16">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No hay datos suficientes para mostrar estadísticas</p>
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimos Pacientes</h3>
          {recentPatients.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No hay pacientes registrados</p>
              <p className="text-sm">Comienza agregando tu primer paciente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{patient.nombre} {patient.apellido}</p>
                    <p className="text-sm text-gray-500 truncate">{patient.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
        {recentActivity.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No hay actividad reciente</p>
            <p className="text-sm">La actividad aparecerá aquí una vez que comiences a usar la aplicación</p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivity.map((activity, activityIdx) => {
                const Icon = getActivityIcon(activity.type);
                const colorClasses = getActivityColor(activity.type);
                return (
                  <li key={activityIdx}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivity.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${colorClasses}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900 font-medium">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: es })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}