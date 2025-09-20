-- Boards table
CREATE TABLE boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  categories JSONB NOT NULL DEFAULT '[
    {"name": "GOOD BOYY", "color": "#87CEEB", "position": 0},
    {"name": "HELL YEAH", "color": "#90EE90", "position": 1},
    {"name": "FUCKIN''", "color": "#FFA07A", "position": 2},
    {"name": "IN THE FIRE", "color": "#1a1a1a", "position": 3}
  ]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Board sessions table
CREATE TABLE board_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,
  shareable_code TEXT UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pin placements table
CREATE TABLE pin_placements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES board_sessions(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  category_index INTEGER NOT NULL CHECK (category_index >= 0 AND category_index <= 3),
  x_position FLOAT DEFAULT 50,
  y_position FLOAT DEFAULT 50,
  placed_by TEXT DEFAULT 'anonymous',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_placements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own boards" ON boards FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Users can create boards" ON boards FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Anyone can view active sessions" ON board_sessions FOR SELECT USING (is_active = true);
CREATE POLICY "Board creators can manage sessions" ON board_sessions FOR ALL USING (
  board_id IN (SELECT id FROM boards WHERE creator_id = auth.uid())
);

CREATE POLICY "Anyone can view pins in active sessions" ON pin_placements FOR SELECT USING (
  session_id IN (SELECT id FROM board_sessions WHERE is_active = true)
);
CREATE POLICY "Anyone can modify pins in active sessions" ON pin_placements FOR ALL USING (
  session_id IN (SELECT id FROM board_sessions WHERE is_active = true)
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE pin_placements;
