-- ============================================================================
-- FORGE PLATFORM DEMO SEED SQL PACKAGE
-- ============================================================================
-- This SQL script defines the complete schema and seed data for Forge demo
-- workspaces, projects, workflow statuses, labels, and issue templates.
--
-- Running this script locally or in an external SQL database creates self-contained
-- demo workspaces without cluttering or bloating your active Convex production data.
-- ============================================================================

-- 1. Schema Definition
CREATE TABLE IF NOT EXISTS demo_workspaces (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon_key VARCHAR(64) DEFAULT 'compass',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demo_users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(32) NOT NULL DEFAULT 'member',
    avatar_key VARCHAR(64) DEFAULT 'fox',
    job_title VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS demo_projects (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES demo_workspaces(id) ON DELETE CASCADE,
    key VARCHAR(16) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_key VARCHAR(64) DEFAULT 'box',
    target_count INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demo_labels (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES demo_workspaces(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    color VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS demo_issues (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES demo_workspaces(id) ON DELETE CASCADE,
    project_id VARCHAR(64) NOT NULL REFERENCES demo_projects(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    title VARCHAR(512) NOT NULL,
    description TEXT,
    priority VARCHAR(32) NOT NULL DEFAULT 'medium',
    status_name VARCHAR(64) NOT NULL DEFAULT 'Todo',
    assignee_id VARCHAR(64) REFERENCES demo_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed Workspaces
INSERT INTO demo_workspaces (id, name, slug, icon_key) VALUES
('ws_northstar', 'Northstar Labs', 'demo-northstar-labs', 'compass'),
('ws_pixel', 'Pixel Forge', 'demo-pixel-forge', 'palette'),
('ws_quiet', 'Quiet Harbor', 'demo-quiet-harbor', 'shield')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Users
INSERT INTO demo_users (id, name, email, role, avatar_key, job_title) VALUES
('usr_elena', 'Elena Rostova', 'elena@demo.invalid', 'admin', 'owl', 'VP of Engineering'),
('usr_marcus', 'Marcus Chen', 'marcus@demo.invalid', 'member', 'bear', 'Lead Mobile Architect'),
('usr_sofia', 'Sofia Patel', 'sofia@demo.invalid', 'member', 'rabbit', 'Staff Backend Engineer'),
('usr_devon', 'Devon Vance', 'devon@demo.invalid', 'member', 'cat', 'Senior DevOps Engineer'),
('usr_liam', 'Liam O''Connor', 'liam@demo.invalid', 'viewer', 'deer', 'Product Designer'),
('usr_aria', 'Aria Tanaka', 'aria@demo.invalid', 'admin', 'koala', 'Creative Director'),
('usr_kai', 'Kai Lindholm', 'kai@demo.invalid', 'member', 'wolf', 'Graphics Systems Lead'),
('usr_nadia', 'Nadia Al-Mansoor', 'nadia@demo.invalid', 'admin', 'tiger', 'Chief Security Officer')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Projects
INSERT INTO demo_projects (id, workspace_id, key, name, description, icon_key, target_count) VALUES
('prj_mob', 'ws_northstar', 'MOB', 'Mobile Client', 'Cross-platform iOS and Android client architecture with offline sync', 'compass', 75),
('prj_bil', 'ws_northstar', 'BIL', 'Billing & Subscriptions', 'Stripe integration, usage metering, and invoice generation', 'prism', 62),
('prj_web', 'ws_northstar', 'WEB', 'Web Application', 'React dashboard, real-time collaboration canvas, and issue editor', 'orbit', 88),
('prj_plt', 'ws_northstar', 'PLT', 'Platform & Infra', 'Kubernetes cluster, edge routing, observability, and auth gateway', 'anchor', 104),
('prj_dat', 'ws_northstar', 'DAT', 'Data Pipeline', 'ClickHouse OLAP ingest, Kafka streaming, and data quality metrics', 'hexagon', 56),
('prj_eng', 'ws_pixel', 'ENG', 'Render Engine', 'WebGL canvas rasterizer, WebGPU compute pipelines, and shaders', 'palette', 65),
('prj_ui', 'ws_pixel', 'UI', 'Studio Interface', 'Design system components, timeline ruler, and keyframe sequencer', 'sparkles', 80),
('prj_enc', 'ws_quiet', 'ENC', 'Zero-Knowledge Vault', 'End-to-end encryption protocols and local master key derivation', 'shield', 70)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Labels
INSERT INTO demo_labels (id, workspace_id, name, color) VALUES
('lbl_bug', 'ws_northstar', 'bug', '#F06A6A'),
('lbl_feat', 'ws_northstar', 'feature', '#3ECF8E'),
('lbl_imp', 'ws_northstar', 'improvement', '#4F8FF7'),
('lbl_rev', 'ws_northstar', 'needs-review', '#B98AF5'),
('lbl_sec', 'ws_northstar', 'security', '#E05353')
ON CONFLICT (id) DO NOTHING;

-- 6. Sample Representative Issues
INSERT INTO demo_issues (id, workspace_id, project_id, number, title, priority, status_name, assignee_id) VALUES
('iss_mob_1', 'ws_northstar', 'prj_mob', 1, 'Fix biometric authentication crash on Android 14', 'urgent', 'In Progress', 'usr_marcus'),
('iss_mob_2', 'ws_northstar', 'prj_mob', 2, 'Implement optimistic offline mutations queue', 'high', 'Review', 'usr_marcus'),
('iss_mob_3', 'ws_northstar', 'prj_mob', 3, 'Support dark mode dynamic color tokens across screens', 'medium', 'Done', 'usr_liam'),
('iss_bil_1', 'ws_northstar', 'prj_bil', 1, 'Audit Stripe webhook signature verification against replay attacks', 'urgent', 'In Progress', 'usr_sofia'),
('iss_bil_2', 'ws_northstar', 'prj_bil', 2, 'Enforce prorated calculation on mid-cycle subscription tier adjustments', 'high', 'Todo', 'usr_sofia'),
('iss_plt_1', 'ws_northstar', 'prj_plt', 1, 'Configure dead letter queue and alert webhooks for failed telemetry events', 'high', 'Done', 'usr_devon')
ON CONFLICT (id) DO NOTHING;
