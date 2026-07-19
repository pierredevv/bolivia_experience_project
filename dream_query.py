import sqlite3, json
from datetime import datetime

DB_PATH = r'C:\Users\PIETRO\.local\share\mimocode\mimocode.db'
PROJECT_ID = '49384076-4041-4cf6-b795-7adc891be24c'
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# Get all session IDs for this project
cur.execute("""
    SELECT s.id
    FROM session s
    WHERE s.project_id = ?
""", (PROJECT_ID,))
session_ids = [r[0] for r in cur.fetchall()]

# Search for repeated error patterns in assistant messages
print("=== REPEATED ERRORS/FIXES IN TRAJECTORY ===")
for sid in session_ids:
    cur.execute("""
        SELECT m.id, p.data
        FROM message m
        JOIN part p ON p.message_id = m.id
        WHERE m.session_id = ?
          AND json_extract(m.data, '$.role') = 'assistant'
          AND json_extract(p.data, '$.type') = 'text'
        ORDER BY m.time_created
    """, (sid,))
    for row in cur.fetchall():
        text_data = json.loads(row[1]) if row[1] else {}
        text = text_data.get('text', '')
        # Look for key patterns: Prisma, JWT, Firebase, mounted guard, etc.
        patterns = [
            'Prisma select+include',
            'FlutterSecureStorage',
            'TokenManager',
            'mounted',
            'Firebase',
            'StateNotifier',
            'prisma migrate dev',
            'prisma db push',
            'transform interceptor',
        ]
        text_lower = text.lower()
        for pat in patterns:
            if pat.lower() in text_lower:
                preview = text[:300].replace('\n', ' ')
                print(f"\n  [{pat}] session={sid}:")
                print(f"    {preview[:200]}")
                break

# Search for user communication style patterns
print("\n\n=== USER COMMUNICATION PATTERNS ===")
for sid in session_ids[:5]:  # Only recent sessions
    cur.execute("""
        SELECT m.id, p.data
        FROM message m
        JOIN part p ON p.message_id = m.id
        WHERE m.session_id = ?
          AND json_extract(m.data, '$.role') = 'user'
          AND json_extract(p.data, '$.type') = 'text'
        ORDER BY m.time_created
    """, (sid,))
    for row in cur.fetchall():
        text_data = json.loads(row[1]) if row[1] else {}
        text = text_data.get('text', '')
        keywords = ['commeta', 'error', 'metodica', 'verificando', 'prueba', 'paso a paso', 'no cometas', 'sin errores']
        text_lower = text.lower()
        if any(kw in text_lower for kw in keywords):
            preview = text[:400].replace('\n', ' ')
            print(f"\n  session={sid}:")
            print(f"    {preview}")

# Check for the Stellar Wolf plan
print("\n\n=== STELLAR WOLF PLAN CHECK ===")
cur.execute("""
    SELECT m.id, p.data
    FROM message m
    JOIN part p ON p.message_id = m.id
    WHERE m.session_id IN ({})
      AND json_extract(p.data, '$.type') = 'tool'
      AND p.data LIKE '%stellar-wolf%'
    ORDER BY m.time_created
    LIMIT 5
""".format(','.join(['?' for _ in session_ids])), session_ids)
for row in cur.fetchall():
    tool_data = json.loads(row[1]) if row[1] else {}
    print(f"  Found tool reference: {str(tool_data)[:200]}")

conn.close()
