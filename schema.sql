-- SCHEMA DE BANCO DE DADOS - AXON OS
-- Execute este script no SQL Editor do seu projeto Supabase para criar as tabelas necessárias.

-- 1. Tabela de CRM (Leads)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    instagram VARCHAR(100),
    email VARCHAR(255),
    origin VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Novo Lead' NOT NULL -- Status: Novo Lead, Contato Feito, Reunião Agendada, Proposta Enviada, Negociação, Fechado, Perdido
);

-- Index para otimização de buscas e filtros no CRM
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- 2. Tabela de Clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name VARCHAR(255) NOT NULL, -- Nome da Clínica
    responsible VARCHAR(255) NOT NULL, -- Responsável
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    instagram VARCHAR(100),
    plan VARCHAR(150),
    monthly_value NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    start_date DATE NOT NULL,
    renewal_date DATE,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- 3. Tabela Financeira (Faturamento/Recebíveis)
CREATE TABLE IF NOT EXISTS financials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    value NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    due_date DATE NOT NULL,
    paid BOOLEAN DEFAULT FALSE NOT NULL,
    payment_method VARCHAR(100) DEFAULT 'Pix' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_financials_due_date ON financials(due_date);
CREATE INDEX IF NOT EXISTS idx_financials_paid ON financials(paid);

-- 4. Tabela de Tarefas
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_name VARCHAR(255),
    priority VARCHAR(50) DEFAULT 'Média' NOT NULL, -- Baixa, Média, Alta
    due_date DATE,
    status VARCHAR(50) DEFAULT 'A Fazer' NOT NULL -- A Fazer, Em Andamento, Concluído
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- 5. Tabela de Agenda (Compromissos)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'Call' NOT NULL, -- Reunião, Call, Entrega, Follow-up
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_date_time ON events(date_time);

-- DADOS INICIAIS DE DEMONSTRAÇÃO (Opcional - caso queira popular o banco inicialmente)
-- Descomente as linhas abaixo se desejar dados de demonstração no Supabase.

/*
INSERT INTO leads (name, company, phone, whatsapp, instagram, email, origin, notes, status) VALUES
('Dr. Roberto Silva', 'Clínica Silva Cardio', '11999999999', '11999999999', '@robertosilva.cardio', 'roberto@silvacardio.com.br', 'Instagram', 'Demonstrou interesse no plano Premium de tráfego pago.', 'Novo Lead'),
('Dra. Ana Costa', 'Clínica Costa Estética', '21988888888', '21988888888', '@anacosta.estetica', 'contato@anacosta.com.br', 'Indicação', 'Reunião marcada para alinhar estratégias de captação.', 'Reunião Agendada'),
('Dr. Marcos Oliveira', 'Odonto Premium', '31977777777', '31977777777', '@odontopremium.mg', 'marcos@odontopremium.com', 'Google Ads', 'Enviado proposta de R$ 3.500/mês.', 'Proposta Enviada');

INSERT INTO clients (name, responsible, phone, whatsapp, email, instagram, plan, monthly_value, start_date, renewal_date, notes) VALUES
('Clínica Dermato Glow', 'Dra. Patricia Lima', '11911111111', '11911111111', 'patricia@dermatoglow.com', '@dermatoglow', 'Tráfego Pago + Social Media', 4500.00, '2026-01-15', '2027-01-15', 'Cliente muito satisfeito. Foco em captação de implantes faciais.'),
('Odonto Clean', 'Dr. Felipe Albuquerque', '11922222222', '11922222222', 'felipe@odontoclean.com.br', '@odontoclean.sp', 'Tráfego Pago Essencial', 2500.00, '2026-03-01', '2026-09-01', 'Foco em captação de Invisalign.');

INSERT INTO financials (client_name, value, due_date, paid, payment_method) VALUES
('Clínica Dermato Glow', 4500.00, '2026-06-15', true, 'Pix'),
('Odonto Clean', 2500.00, '2026-06-10', true, 'Boleto'),
('Clínica Dermato Glow', 4500.00, '2026-07-15', false, 'Pix'),
('Odonto Clean', 2500.00, '2026-07-10', false, 'Boleto');

INSERT INTO tasks (title, description, client_name, priority, due_date, status) VALUES
('Criar novos criativos de Estética', 'Produzir 3 artes para feed e 2 stories patrocinados.', 'Clínica Dermato Glow', 'Alta', '2026-06-20', 'Em Andamento'),
('Relatório de Performance Mensal', 'Extrair dados do Meta Ads e estruturar PDF de fechamento de Maio.', 'Odonto Clean', 'Média', '2026-06-25', 'A Fazer'),
('Configuração de Pixel de Conversão', 'Ajustar rastreamento no novo site de agendamento.', 'Clínica Dermato Glow', 'Alta', '2026-06-18', 'Concluído');

INSERT INTO events (title, type, date_time, description) VALUES
('Alinhamento Mensal Dermato Glow', 'Reunião', '2026-06-18 14:00:00+00', 'Apresentação de relatórios e novos criativos.'),
('Call de Diagnóstico - Lead Dr. Roberto', 'Call', '2026-06-19 10:30:00+00', 'Entender estrutura atual de captação do médico.');
*/
