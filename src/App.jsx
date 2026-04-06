import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts'
import { Plus, DollarSign, TrendingUp, Wallet, Users, Target, CheckCircle2, LayoutDashboard, Briefcase, Funnel, Search, Pencil, Trash2, FileText, Globe, Download, Save, LogOut, UserCircle2, RefreshCcw } from 'lucide-react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
const supabase = HAS_SUPABASE ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null
const DEMO_STORAGE_KEY = 'painel-sites-demo-db-v2'
const DEMO_SETTINGS_KEY = 'painel-sites-demo-settings-v2'

const statusOptions = ['Lead', 'Proposta enviada', 'Negociação', 'Fechado', 'Em andamento', 'Entregue', 'Perdido']
const canalOptions = ['Instagram', 'WhatsApp', 'Indicação', 'Facebook', 'Google', 'Tráfego pago', 'Outro']
const tipoOptions = ['Site institucional', 'Landing page', 'Loja virtual', 'Manutenção', 'Tráfego/extra']

const initialEmpresa = { nome: 'Sua Agência Digital', email: 'contato@suaagencia.com', telefone: '(31) 99999-0000', site: 'https://suaagencia.com', cidade: 'Betim - MG' }
const initialForm = { cliente: '', tipo: 'Site institucional', canal: 'Instagram', status: 'Lead', valor: '', custo: '', mensalidade: '', data: new Date().toISOString().slice(0,10), responsavel: '', email: '', telefone: '', prazo: '7 dias', observacoes: '' }
const seedData = [{ id: crypto.randomUUID(), cliente: 'Clínica Vida', tipo: 'Site institucional', canal: 'Instagram', status: 'Fechado', valor: 2500, custo: 600, mensalidade: 149, data: '2026-04-02', responsavel: 'João', email: 'contato@clinicavida.com', telefone: '(31) 99999-1111', prazo: '10 dias', observacoes: 'Projeto com foco em captação de leads e WhatsApp.', user_id: 'demo-user', created_at: new Date().toISOString() }]

const moeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0))
const statusBadge = (status) => ({ Lead:'bg-cyan-100 text-cyan-800 border-cyan-200', 'Proposta enviada':'bg-amber-100 text-amber-800 border-amber-200', Negociação:'bg-orange-100 text-orange-800 border-orange-200', Fechado:'bg-emerald-100 text-emerald-800 border-emerald-200', 'Em andamento':'bg-blue-100 text-blue-800 border-blue-200', Entregue:'bg-violet-100 text-violet-800 border-violet-200', Perdido:'bg-rose-100 text-rose-800 border-rose-200' }[status] || 'bg-slate-100 text-slate-700 border-slate-200')

function makeProposalText(registro, empresa) {
  return `PROPOSTA COMERCIAL\n\nPrestador: ${empresa.nome}\nE-mail: ${empresa.email}\nTelefone: ${empresa.telefone}\nSite: ${empresa.site}\nCidade: ${empresa.cidade}\n\nCliente: ${registro.cliente}\nE-mail: ${registro.email || 'Não informado'}\nTelefone: ${registro.telefone || 'Não informado'}\nData: ${new Date(registro.data).toLocaleDateString('pt-BR')}\n\nObjeto:\nDesenvolvimento de ${registro.tipo}.\n\nPrazo estimado:\n${registro.prazo || 'A combinar'}\n\nInvestimento:\nValor do projeto: ${moeda(registro.valor)}\nMensalidade/manutenção: ${moeda(registro.mensalidade)}\n\nObservações:\n${registro.observacoes || 'Sem observações adicionais.'}\n\nAssinatura:\n${empresa.nome}`
}
function makeContractText(registro, empresa) {
  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS\n\nCONTRATADA: ${empresa.nome}, contato ${empresa.email}, ${empresa.telefone}, ${empresa.cidade}.\nCONTRATANTE: ${registro.cliente}, e-mail ${registro.email || 'não informado'}, telefone ${registro.telefone || 'não informado'}.\n\n1. OBJETO\nA CONTRATADA prestará serviços de desenvolvimento de ${registro.tipo}.\n\n2. PRAZO\nO prazo estimado para entrega é de ${registro.prazo || 'a combinar'}.\n\n3. VALORES\nValor do projeto: ${moeda(registro.valor)}.\nMensalidade/manutenção: ${moeda(registro.mensalidade)}.\n\nData: ${new Date(registro.data).toLocaleDateString('pt-BR')}\n\nCONTRATADA: ${empresa.nome}\nCONTRATANTE: ${registro.cliente}`
}
function downloadTextFile(filename, content) { const blob = new Blob([content], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url) }

function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleDemoEnter = () => { const demoUser = { id: 'demo-user', email: 'demo@painel.com' }; localStorage.setItem('painel-sites-demo-user', JSON.stringify(demoUser)); onAuthSuccess(demoUser) }
  const handleAuth = async () => {
    setLoading(true); setMessage('')
    try {
      if (!HAS_SUPABASE) return handleDemoEnter()
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; onAuthSuccess(data.user)
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password }); if (error) throw error; setMessage('Conta criada.'); if (data.user) onAuthSuccess(data.user)
      }
    } catch (err) { setMessage(err.message || 'Erro ao autenticar.') } finally { setLoading(false) }
  }

  return <div className="grid min-h-screen items-center bg-gradient-to-br from-fuchsia-100 via-sky-50 to-emerald-50 p-6 lg:grid-cols-2"><div className="space-y-6"><div className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-fuchsia-700 shadow">Painel premium para vender sites</div><div><h1 className="text-5xl font-black text-slate-900">Mais cor, mais controle, mais lucro.</h1><p className="mt-4 max-w-xl text-lg text-slate-600">CRM, financeiro, propostas, contratos e banco online.</p></div></div><Card className="mx-auto w-full max-w-md rounded-[2rem] border-0 bg-white/95 shadow-2xl"><CardHeader><CardTitle className="text-2xl">{mode === 'login' ? 'Entrar' : 'Criar conta'}</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>E-mail</Label><Input value={email} onChange={(e)=>setEmail(e.target.value)} /></div><div><Label>Senha</Label><Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /></div>{message && <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">{message}</div>}<Button onClick={handleAuth} disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-blue-600 py-6">{loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</Button><Button variant="outline" onClick={handleDemoEnter} className="w-full rounded-2xl py-6">Testar em modo demo</Button><button onClick={()=>setMode(mode === 'login' ? 'register' : 'login')} className="w-full text-sm text-slate-600">{mode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}</button></CardContent></Card></div>
}

export default function App() {
  const [user, setUser] = useState(null)
  const [registros, setRegistros] = useState([])
  const [empresa, setEmpresa] = useState(initialEmpresa)
  const [metaMes, setMetaMes] = useState(10000)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('Todos')
  const [form, setForm] = useState(initialForm)
  const [editandoId, setEditandoId] = useState(null)
  const [registroSelecionado, setRegistroSelecionado] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [info, setInfo] = useState('')

  const bootstrapDemo = () => {
    const existingUser = JSON.parse(localStorage.getItem('painel-sites-demo-user') || 'null')
    if (existingUser) setUser(existingUser)
    const saved = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || 'null')
    const savedSettings = JSON.parse(localStorage.getItem(DEMO_SETTINGS_KEY) || 'null')
    setRegistros(saved || seedData)
    if (savedSettings?.empresa) setEmpresa(savedSettings.empresa)
    if (savedSettings?.metaMes) setMetaMes(savedSettings.metaMes)
    setLoading(false)
  }

  const loadData = async (currentUser) => {
    if (!currentUser) return
    setLoading(true)
    try {
      if (!HAS_SUPABASE) return bootstrapDemo()
      const [{ data: vendas, error: vendasError }, { data: settings, error: settingsError }] = await Promise.all([
        supabase.from('sales_records').select('*').eq('user_id', currentUser.id).order('data', { ascending: false }),
        supabase.from('app_settings').select('*').eq('user_id', currentUser.id).maybeSingle(),
      ])
      if (vendasError) throw vendasError
      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError
      setRegistros(vendas || [])
      if (settings?.empresa_json) setEmpresa(settings.empresa_json)
      if (settings?.meta_mes) setMetaMes(settings.meta_mes)
    } catch (err) { setInfo(err.message || 'Erro ao carregar dados.') } finally { setLoading(false) }
  }

useEffect(() => {
  let mounted = true;
  let subscription = null;

  const init = async () => {
    try {
      if (!HAS_SUPABASE) {
        if (mounted) bootstrapDemo();
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      const currentUser = data.session?.user || null;

      if (!mounted) return;

      setUser(currentUser);

      if (currentUser) {
        await loadData(currentUser);
      } else {
        setRegistros([]);
        setLoading(false);
      }

      const listener = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;

        const nextUser = session?.user || null;
        setUser(nextUser);

        if (nextUser) {
          await loadData(nextUser);
        } else {
          setRegistros([]);
          setLoading(false);
        }
      });

      subscription = listener.data.subscription;
    } catch (err) {
      if (mounted) {
        setInfo(err.message || "Erro ao iniciar sessão.");
        setLoading(false);
      }
    }
  };

  init();

  return () => {
    mounted = false;
    if (subscription) subscription.unsubscribe();
  };
}, []);
  useEffect(() => { if (!HAS_SUPABASE) localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(registros)) }, [registros])
  useEffect(() => { if (!HAS_SUPABASE) localStorage.setItem(DEMO_SETTINGS_KEY, JSON.stringify({ empresa, metaMes })) }, [empresa, metaMes])

  const registrosFiltrados = useMemo(() => registros.filter((r) => ([r.cliente, r.tipo, r.canal, r.status, r.responsavel, r.email, r.telefone].join(' ').toLowerCase().includes(busca.toLowerCase())) && (filtroStatus === 'Todos' || r.status === filtroStatus)), [registros, busca, filtroStatus])
  const metricas = useMemo(() => { const fechados = registros.filter((r)=>['Fechado','Em andamento','Entregue'].includes(r.status)); const faturamento = fechados.reduce((acc,r)=>acc+Number(r.valor||0),0); const custos = fechados.reduce((acc,r)=>acc+Number(r.custo||0),0); const lucro = faturamento-custos; const recorrencia = registros.reduce((acc,r)=>acc+Number(r.mensalidade||0),0); const leads = registros.filter((r)=>['Lead','Proposta enviada','Negociação'].includes(r.status)).length; const convertidos = fechados.length; const taxa = registros.length ? (convertidos/registros.length)*100 : 0; return { faturamento, custos, lucro, recorrencia, leads, taxa } }, [registros])
  const graficoMensal = useMemo(() => { const mapa = new Map(); registros.forEach((r)=>{ const chave = new Date(r.data).toLocaleDateString('pt-BR', { month: 'short' }); const atual = mapa.get(chave) || { mes: chave, faturamento: 0, lucro: 0 }; if (['Fechado','Em andamento','Entregue'].includes(r.status)) { atual.faturamento += Number(r.valor||0); atual.lucro += Number(r.valor||0) - Number(r.custo||0) } mapa.set(chave, atual) }); return Array.from(mapa.values()) }, [registros])
  const distribuicaoStatus = useMemo(() => statusOptions.map((status)=>({ name: status, value: registros.filter((r)=>r.status===status).length })).filter((item)=>item.value>0), [registros])
  const progressoMeta = Math.min((metricas.faturamento / Number(metaMes || 1)) * 100, 100)

  const resetForm = () => { setForm({ ...initialForm, responsavel: user?.email?.split('@')[0] || 'João' }); setEditandoId(null) }
  const saveSettings = async () => { try { if (!user) return; if (!HAS_SUPABASE) { setInfo('Configurações salvas no modo demo.'); return } const { error } = await supabase.from('app_settings').upsert({ user_id: user.id, meta_mes: Number(metaMes || 0), empresa_json: empresa }, { onConflict: 'user_id' }); if (error) throw error; setInfo('Configurações salvas com sucesso.') } catch (err) { setInfo(err.message || 'Erro ao salvar configurações.') } }
  const saveRecord = async () => {
    if (!form.cliente || !form.valor || !user) return setInfo('Preencha pelo menos cliente e valor.')
    setSaving(true); setInfo('')
    const payload = { id: editandoId || crypto.randomUUID(), user_id: user.id, cliente: form.cliente, tipo: form.tipo, canal: form.canal, status: form.status, valor: Number(form.valor||0), custo: Number(form.custo||0), mensalidade: Number(form.mensalidade||0), data: form.data, responsavel: form.responsavel || user.email?.split('@')[0] || 'Usuário', email: form.email, telefone: form.telefone, prazo: form.prazo, observacoes: form.observacoes }
    try {
      if (!HAS_SUPABASE) setRegistros((prev)=>prev.some((item)=>item.id===payload.id) ? prev.map((item)=>item.id===payload.id?payload:item) : [payload, ...prev])
      else { const { error } = await supabase.from('sales_records').upsert(payload); if (error) throw error; await loadData(user) }
      resetForm(); setModalOpen(false); setInfo(editandoId ? 'Registro atualizado.' : 'Registro criado.')
    } catch (err) { setInfo(err.message || 'Erro ao salvar registro.') } finally { setSaving(false) }
  }
  const handleEdit = (registro) => { setEditandoId(registro.id); setForm({ cliente: registro.cliente || '', tipo: registro.tipo || 'Site institucional', canal: registro.canal || 'Instagram', status: registro.status || 'Lead', valor: String(registro.valor || ''), custo: String(registro.custo || ''), mensalidade: String(registro.mensalidade || ''), data: registro.data || new Date().toISOString().slice(0,10), responsavel: registro.responsavel || '', email: registro.email || '', telefone: registro.telefone || '', prazo: registro.prazo || '7 dias', observacoes: registro.observacoes || '' }); setModalOpen(true) }
  const handleDelete = async (id) => { if (!window.confirm('Tem certeza que deseja excluir este registro?')) return; try { if (!HAS_SUPABASE) setRegistros((prev)=>prev.filter((item)=>item.id!==id)); else { const { error } = await supabase.from('sales_records').delete().eq('id', id).eq('user_id', user.id); if (error) throw error; await loadData(user) } if (editandoId === id) resetForm(); setInfo('Registro excluído.') } catch (err) { setInfo(err.message || 'Erro ao excluir registro.') } }
  const handleLogout = async () => { if (!HAS_SUPABASE) { localStorage.removeItem('painel-sites-demo-user'); setUser(null); bootstrapDemo(); return } await supabase.auth.signOut(); setUser(null) }
  const exportBackup = () => downloadTextFile('backup-painel-vendas-sites.json', JSON.stringify({ user, empresa, metaMes, registros }, null, 2))

  if (!user && !loading) return <AuthScreen onAuthSuccess={setUser} />
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-fuchsia-100 via-sky-50 to-emerald-50"><Card className="rounded-3xl border-0 bg-white/90 px-8 py-10 shadow-2xl"><div className="flex items-center gap-3 text-lg font-semibold text-slate-700"><RefreshCcw className="h-5 w-5 animate-spin" />Carregando seu painel...</div></Card></div>

  return <div className="min-h-screen bg-gradient-to-br from-fuchsia-100 via-sky-50 to-emerald-50 p-4 md:p-8"><div className="mx-auto max-w-7xl space-y-6"><div className="overflow-hidden rounded-[2rem] border-0 bg-white shadow-2xl"><div className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-blue-600 p-1" /><div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"><div><div className="mb-2 flex items-center gap-2 text-slate-500"><Briefcase className="h-4 w-4" />CRM + Financeiro + Propostas + Contratos</div><h1 className="text-3xl font-black tracking-tight text-slate-900">Painel profissional de vendas</h1><p className="mt-2 text-sm text-slate-500">Pronto para Vercel + Supabase.</p></div><div className="flex flex-wrap items-center gap-3"><Badge className="rounded-full border-0 bg-emerald-100 px-4 py-2 text-emerald-700">{HAS_SUPABASE ? 'Banco online ativo' : 'Modo demo ativo'}</Badge><Badge className="rounded-full border-0 bg-sky-100 px-4 py-2 text-sky-700"><UserCircle2 className="mr-2 h-4 w-4" />{user.email || 'demo@painel.com'}</Badge><Button variant="outline" className="rounded-2xl" onClick={exportBackup}><Download className="mr-2 h-4 w-4" />Backup</Button><Button className="rounded-2xl bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white" onClick={()=>{ resetForm(); setModalOpen(true) }}><Plus className="mr-2 h-4 w-4" />Novo registro</Button><Button variant="outline" className="rounded-2xl" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Sair</Button></div></div></div>

  {info && <div className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-lg">{info}</div>}

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
    {[['Faturamento', metricas.faturamento, DollarSign, 'from-emerald-500 to-green-600'], ['Custos', metricas.custos, Wallet, 'from-rose-500 to-orange-500'], ['Lucro', metricas.lucro, TrendingUp, 'from-sky-500 to-blue-600'], ['Recorrência', metricas.recorrencia, Target, 'from-violet-500 to-fuchsia-600'], ['Leads ativos', metricas.leads, Users, 'from-cyan-500 to-teal-500'], ['Conversão', `${metricas.taxa.toFixed(1)}%`, CheckCircle2, 'from-amber-500 to-yellow-500']].map(([label, value, Icon, grad]) => <Card key={label} className={`rounded-3xl border-0 bg-gradient-to-br ${grad} text-white shadow-xl`}><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-sm text-white/80">{label}</span><Icon className="h-4 w-4 text-white/80" /></div><div className="mt-3 text-2xl font-black">{typeof value === 'number' ? moeda(value) : value}</div></CardContent></Card>)}
  </div>

  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3"><Card className="rounded-3xl border-0 bg-white shadow-2xl xl:col-span-2"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><LayoutDashboard className="h-5 w-5 text-fuchsia-600" />Visão financeira</CardTitle></CardHeader><CardContent><div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-sm text-slate-500">Meta do mês</p><div className="mt-2 flex items-center gap-3"><Input type="number" value={metaMes} onChange={(e)=>setMetaMes(Number(e.target.value || 0))} className="max-w-[180px] rounded-2xl" /><Button variant="outline" className="rounded-2xl" onClick={saveSettings}>Salvar config</Button></div></div><div className="text-right"><p className="text-sm text-slate-500">Falta para bater a meta</p><p className="mt-1 text-xl font-bold">{moeda(Math.max(Number(metaMes || 0)-metricas.faturamento,0))}</p></div></div><Progress value={progressoMeta} className="mb-4" /><div className="mb-5 text-sm text-slate-500">Alcançado: {progressoMeta.toFixed(0)}%</div><div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={graficoMensal}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis /><Tooltip formatter={(value)=>moeda(value)} /><Bar dataKey="faturamento" radius={[10,10,0,0]} fill="#d946ef" /><Bar dataKey="lucro" radius={[10,10,0,0]} fill="#2563eb" /></BarChart></ResponsiveContainer></div></CardContent></Card><Card className="rounded-3xl border-0 bg-white shadow-2xl"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><Funnel className="h-5 w-5 text-blue-600" />Funil por status</CardTitle></CardHeader><CardContent><div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribuicaoStatus} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} label /><Tooltip /></PieChart></ResponsiveContainer></div><div className="mt-4 flex flex-wrap gap-2">{distribuicaoStatus.map((item)=><Badge key={item.name} variant="outline" className="rounded-xl px-3 py-1">{item.name}: {item.value}</Badge>)}</div></CardContent></Card></div>

  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3"><Card className="rounded-3xl border-0 bg-white shadow-2xl xl:col-span-2"><CardContent className="p-4"><Tabs defaultValue="clientes" className="w-full"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><TabsList className="grid w-full max-w-md grid-cols-2 rounded-2xl bg-slate-100"><TabsTrigger value="clientes" className="rounded-2xl">Clientes e vendas</TabsTrigger><TabsTrigger value="pipeline" className="rounded-2xl">Pipeline</TabsTrigger></TabsList><div className="flex flex-col gap-3 md:flex-row md:items-center"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={busca} onChange={(e)=>setBusca(e.target.value)} placeholder="Buscar cliente, canal, tipo..." className="w-full rounded-2xl pl-9 md:w-80" /></div><Select value={filtroStatus} onValueChange={setFiltroStatus}><SelectTrigger className="hidden"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Todos">Todos os status</SelectItem>{statusOptions.map((item)=><SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div></div><TabsContent value="clientes" className="mt-6"><div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="w-full min-w-[1200px] text-left"><thead className="bg-gradient-to-r from-fuchsia-50 to-sky-50 text-sm text-slate-700"><tr><th className="px-4 py-3 font-medium">Cliente</th><th className="px-4 py-3 font-medium">Contato</th><th className="px-4 py-3 font-medium">Tipo</th><th className="px-4 py-3 font-medium">Canal</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Projeto</th><th className="px-4 py-3 font-medium">Lucro</th><th className="px-4 py-3 font-medium">Mensal</th><th className="px-4 py-3 font-medium">Data</th><th className="px-4 py-3 font-medium text-right">Ações</th></tr></thead><tbody>{registrosFiltrados.length===0 && <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-500">Nenhum registro encontrado.</td></tr>}{registrosFiltrados.map((r,index)=><tr key={r.id} className={`border-t text-sm ${index%2===0?'bg-white':'bg-slate-50/60'} hover:bg-fuchsia-50/50`}><td className="px-4 py-4 font-medium text-slate-900">{r.cliente}<div className="mt-1 text-xs text-slate-500">{r.responsavel}</div></td><td className="px-4 py-4"><div>{r.email || '—'}</div><div className="mt-1 text-xs text-slate-500">{r.telefone || '—'}</div></td><td className="px-4 py-4">{r.tipo}</td><td className="px-4 py-4">{r.canal}</td><td className="px-4 py-4"><Badge className={`rounded-xl border ${statusBadge(r.status)}`}>{r.status}</Badge></td><td className="px-4 py-4">{moeda(r.valor)}</td><td className="px-4 py-4 font-bold text-emerald-700">{moeda(Number(r.valor||0)-Number(r.custo||0))}</td><td className="px-4 py-4">{moeda(r.mensalidade)}</td><td className="px-4 py-4">{new Date(r.data).toLocaleDateString('pt-BR')}</td><td className="px-4 py-4"><div className="flex items-center justify-end gap-2"><Button variant="outline" size="sm" className="rounded-xl" onClick={()=>handleEdit(r)}><Pencil className="h-4 w-4" /></Button><Button variant="outline" size="sm" className="rounded-xl" onClick={()=>setRegistroSelecionado(r)}><FileText className="h-4 w-4" /></Button><Button variant="outline" size="sm" className="rounded-xl" onClick={()=>handleDelete(r.id)}><Trash2 className="h-4 w-4" /></Button></div></td></tr>)}</tbody></table></div></TabsContent><TabsContent value="pipeline" className="mt-6"><div className="grid grid-cols-1 gap-4 lg:grid-cols-4">{[{ titulo:'Topo', cor:'from-cyan-500 to-sky-500', itens: registros.filter((r)=>['Lead','Proposta enviada'].includes(r.status)) }, { titulo:'Quente', cor:'from-amber-500 to-orange-500', itens: registros.filter((r)=>r.status==='Negociação') }, { titulo:'Fechados', cor:'from-emerald-500 to-green-600', itens: registros.filter((r)=>['Fechado','Em andamento'].includes(r.status)) }, { titulo:'Entregues', cor:'from-violet-500 to-fuchsia-600', itens: registros.filter((r)=>r.status==='Entregue') }].map((coluna)=><Card key={coluna.titulo} className="overflow-hidden rounded-3xl border-0 shadow-xl"><div className={`bg-gradient-to-r ${coluna.cor} p-4 text-white`}><div className="flex items-center justify-between text-base font-bold"><span>{coluna.titulo}</span><span>{coluna.itens.length}</span></div></div><CardContent className="space-y-3 bg-white p-4">{coluna.itens.length===0 && <div className="rounded-2xl border border-dashed p-4 text-sm text-slate-400">Nenhum item aqui</div>}{coluna.itens.map((item)=><div key={item.id} className="rounded-2xl border bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{item.cliente}</h3><p className="mt-1 text-sm text-slate-500">{item.tipo}</p></div><Badge variant="outline" className="rounded-xl">{item.canal}</Badge></div><div className="mt-4 space-y-2 text-sm"><div className="flex items-center justify-between"><span className="text-slate-500">Projeto</span><span className="font-medium">{moeda(item.valor)}</span></div><div className="flex items-center justify-between"><span className="text-slate-500">Lucro</span><span className="font-medium text-emerald-700">{moeda(Number(item.valor||0)-Number(item.custo||0))}</span></div><div className="flex items-center justify-between"><span className="text-slate-500">Mensalidade</span><span className="font-medium">{moeda(item.mensalidade)}</span></div></div></div>)}</CardContent></Card>)}</div></TabsContent></Tabs></CardContent></Card><Card className="rounded-3xl border-0 bg-white shadow-2xl"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Globe className="h-5 w-5 text-blue-600" />Configuração da empresa</CardTitle></CardHeader><CardContent className="space-y-3"><div><Label>Nome</Label><Input value={empresa.nome} onChange={(e)=>setEmpresa({ ...empresa, nome: e.target.value })} className="rounded-2xl" /></div><div><Label>E-mail</Label><Input value={empresa.email} onChange={(e)=>setEmpresa({ ...empresa, email: e.target.value })} className="rounded-2xl" /></div><div><Label>Telefone</Label><Input value={empresa.telefone} onChange={(e)=>setEmpresa({ ...empresa, telefone: e.target.value })} className="rounded-2xl" /></div><div><Label>Site</Label><Input value={empresa.site} onChange={(e)=>setEmpresa({ ...empresa, site: e.target.value })} className="rounded-2xl" /></div><div><Label>Cidade</Label><Input value={empresa.cidade} onChange={(e)=>setEmpresa({ ...empresa, cidade: e.target.value })} className="rounded-2xl" /></div><Button onClick={saveSettings} className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-fuchsia-600 py-6 text-base text-white">Salvar configurações</Button></CardContent></Card></div>

  <Dialog open={modalOpen} onOpenChange={setModalOpen}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl rounded-3xl"><DialogHeader><DialogTitle>{editandoId ? 'Editar registro' : 'Novo registro'}</DialogTitle></DialogHeader><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><Label>Cliente</Label><Input value={form.cliente} onChange={(e)=>setForm({ ...form, cliente: e.target.value })} className="rounded-2xl" /></div><div><Label>Responsável</Label><Input value={form.responsavel} onChange={(e)=>setForm({ ...form, responsavel: e.target.value })} className="rounded-2xl" /></div><div><Label>E-mail</Label><Input value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} className="rounded-2xl" /></div><div><Label>Telefone</Label><Input value={form.telefone} onChange={(e)=>setForm({ ...form, telefone: e.target.value })} className="rounded-2xl" /></div><div><Label>Tipo</Label><Select value={form.tipo} onValueChange={(value)=>setForm({ ...form, tipo: value })}><SelectTrigger className="hidden"><SelectValue /></SelectTrigger><SelectContent>{tipoOptions.map((item)=><SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div><Label>Canal</Label><Select value={form.canal} onValueChange={(value)=>setForm({ ...form, canal: value })}><SelectTrigger className="hidden"><SelectValue /></SelectTrigger><SelectContent>{canalOptions.map((item)=><SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div><Label>Status</Label><Select value={form.status} onValueChange={(value)=>setForm({ ...form, status: value })}><SelectTrigger className="hidden"><SelectValue /></SelectTrigger><SelectContent>{statusOptions.map((item)=><SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div><Label>Data</Label><Input type="date" value={form.data} onChange={(e)=>setForm({ ...form, data: e.target.value })} className="rounded-2xl" /></div><div><Label>Valor do projeto</Label><Input type="number" value={form.valor} onChange={(e)=>setForm({ ...form, valor: e.target.value })} className="rounded-2xl" /></div><div><Label>Custo</Label><Input type="number" value={form.custo} onChange={(e)=>setForm({ ...form, custo: e.target.value })} className="rounded-2xl" /></div><div><Label>Mensalidade</Label><Input type="number" value={form.mensalidade} onChange={(e)=>setForm({ ...form, mensalidade: e.target.value })} className="rounded-2xl" /></div><div><Label>Prazo</Label><Input value={form.prazo} onChange={(e)=>setForm({ ...form, prazo: e.target.value })} className="rounded-2xl" /></div><div className="md:col-span-2"><Label>Observações</Label><Textarea value={form.observacoes} onChange={(e)=>setForm({ ...form, observacoes: e.target.value })} className="rounded-2xl" /></div></div><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"><Button onClick={saveRecord} disabled={saving} className="rounded-2xl bg-gradient-to-r from-fuchsia-600 to-blue-600 py-6 text-base text-white"><Save className="mr-2 h-4 w-4" />{saving ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Criar registro'}</Button><Button variant="outline" onClick={()=>{ resetForm(); setModalOpen(false) }} className="rounded-2xl py-6 text-base">Cancelar</Button></div></DialogContent></Dialog>

  <Dialog open={!!registroSelecionado} onOpenChange={(open)=>!open && setRegistroSelecionado(null)}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl rounded-3xl"><DialogHeader><DialogTitle>Proposta e contrato</DialogTitle></DialogHeader>{registroSelecionado && <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><Card className="rounded-2xl border-0 shadow-lg"><CardHeader><CardTitle className="text-base">Proposta comercial</CardTitle></CardHeader><CardContent className="space-y-3"><pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-xs text-slate-700">{makeProposalText(registroSelecionado, empresa)}</pre><Button className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white" onClick={()=>downloadTextFile(`proposta-${registroSelecionado.cliente}.txt`, makeProposalText(registroSelecionado, empresa))}><Download className="mr-2 h-4 w-4" />Baixar proposta</Button></CardContent></Card><Card className="rounded-2xl border-0 shadow-lg"><CardHeader><CardTitle className="text-base">Contrato</CardTitle></CardHeader><CardContent className="space-y-3"><pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-xs text-slate-700">{makeContractText(registroSelecionado, empresa)}</pre><Button className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white" onClick={()=>downloadTextFile(`contrato-${registroSelecionado.cliente}.txt`, makeContractText(registroSelecionado, empresa))}><Download className="mr-2 h-4 w-4" />Baixar contrato</Button></CardContent></Card></div>}</DialogContent></Dialog>
  </div></div>
}
