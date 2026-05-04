import express from 'express'
import cors from 'cors'
import postgres from 'postgres'
import bcrypt from 'bcryptjs'

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })
const app = express()
app.use(cors())
app.use(express.json())

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'fca-secret-2024'

// ── AUTH MIDDLEWARE ────────────────────────────────────────────────────────
// Routes publiques (lecture seule)
const PUBLIC_GET = ['/api/vehicles', '/api/blog', '/api/comments']
const PUBLIC_POST = ['/api/users/login', '/api/listings', '/api/comments', '/api/likes']

function authMiddleware(req, res, next) {
  const isPublicGet = req.method === 'GET' && PUBLIC_GET.some((p) => req.path.startsWith(p))
  const isPublicPost = req.method === 'POST' && PUBLIC_POST.some((p) => req.path.startsWith(p))
  if (isPublicGet || isPublicPost) return next()
  // Routes GET spéciales publiques
  if (req.method === 'GET' && req.path.startsWith('/api/likes')) return next()
  if (req.method === 'GET' && req.path.startsWith('/api/blog/')) return next()

  const token = req.headers['x-admin-secret']
  if (token !== ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' })
  next()
}

app.use(authMiddleware)

// ── VEHICLES ──────────────────────────────────────────────────────────────

app.get('/api/vehicles', async (req, res) => {
  try {
    const { type, brand, fuel, transmission, minPrice, maxPrice, sort, featured, limit = 50, offset = 0 } = req.query
    let conditions = ['1=1']
    const params = []
    let i = 1

    if (type)         { conditions.push(`type = $${i++}`);         params.push(type) }
    if (brand)        { conditions.push(`brand = $${i++}`);        params.push(brand) }
    if (fuel)         { conditions.push(`fuel = $${i++}`);         params.push(fuel) }
    if (transmission) { conditions.push(`transmission = $${i++}`); params.push(transmission) }
    if (minPrice)     { conditions.push(`price >= $${i++}`);       params.push(Number(minPrice)) }
    if (maxPrice)     { conditions.push(`price <= $${i++}`);       params.push(Number(maxPrice)) }
    if (featured)     { conditions.push(`featured = $${i++}`);     params.push(Number(featured)) }

    const orderBy = sort === 'price_asc' ? 'price ASC'
      : sort === 'price_desc' ? 'price DESC'
      : 'created_at DESC'

    const where = conditions.join(' AND ')
    const [{ total }] = await sql.unsafe(`SELECT COUNT(*)::int as total FROM vehicles WHERE ${where}`, params)
    const rows = await sql.unsafe(
      `SELECT * FROM vehicles WHERE ${where} ORDER BY ${orderBy} LIMIT $${i} OFFSET $${i + 1}`,
      [...params, Number(limit), Number(offset)]
    )
    res.json({ data: rows, total, limit: Number(limit), offset: Number(offset) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const [row] = await sql`SELECT * FROM vehicles WHERE id = ${req.params.id}`
    if (!row) return res.status(404).json({ error: 'Not found' })
    res.json(row)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/vehicles', async (req, res) => {
  try {
    const d = req.body
    const [row] = await sql`
      INSERT INTO vehicles (brand, model, year, price, price_per_day, type, status, fuel, transmission,
        mileage, seats, color, description, images, videos, location, featured, view_count, user_id)
      VALUES (${d.brand}, ${d.model}, ${d.year}, ${d.price}, ${d.price_per_day ?? null}, ${d.type},
        ${d.status ?? 'available'}, ${d.fuel}, ${d.transmission}, ${d.mileage}, ${d.seats ?? 5},
        ${d.color ?? null}, ${d.description ?? null},
        ${JSON.stringify(d.images ?? [])}::jsonb, ${JSON.stringify(d.videos ?? [])}::jsonb,
        ${d.location}, ${d.featured ?? 0}, 0, ${d.user_id ?? null})
      RETURNING *`
    res.json(row)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const d = req.body
    const [row] = await sql`
      UPDATE vehicles SET
        brand=${d.brand}, model=${d.model}, year=${d.year}, price=${d.price},
        price_per_day=${d.price_per_day ?? null}, type=${d.type}, status=${d.status},
        fuel=${d.fuel}, transmission=${d.transmission}, mileage=${d.mileage},
        seats=${d.seats ?? 5}, color=${d.color ?? null}, description=${d.description ?? null},
        images=${JSON.stringify(d.images ?? [])}::jsonb, videos=${JSON.stringify(d.videos ?? [])}::jsonb,
        location=${d.location}, featured=${d.featured ?? 0}, updated_at=now()
      WHERE id=${req.params.id} RETURNING *`
    res.json(row)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    await sql`DELETE FROM vehicles WHERE id = ${req.params.id}`
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── LISTINGS ──────────────────────────────────────────────────────────────

app.get('/api/listings', async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 50)
    const offset = Number(req.query.offset ?? 0)
    const [{ total }] = await sql`SELECT COUNT(*)::int as total FROM listings`
    const rows = await sql`SELECT * FROM listings ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
    res.json({ data: rows, total, limit, offset })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/listings', async (req, res) => {
  try {
    const d = req.body
    const [row] = await sql`
      INSERT INTO listings (seller_name, seller_phone, seller_email, brand, model, year, price,
        type, fuel, transmission, mileage, color, location, description, images, status)
      VALUES (${d.seller_name}, ${d.seller_phone}, ${d.seller_email ?? null}, ${d.brand},
        ${d.model}, ${d.year}, ${d.price}, ${d.type}, ${d.fuel}, ${d.transmission},
        ${d.mileage}, ${d.color ?? null}, ${d.location}, ${d.description ?? null},
        ${JSON.stringify(d.images ?? [])}::jsonb, 'pending')
      RETURNING *`
    res.json(row)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.patch('/api/listings/:id', async (req, res) => {
  try {
    const { status } = req.body
    const [row] = await sql`
      UPDATE listings SET status=${status}, updated_at=now()
      WHERE id=${req.params.id} RETURNING *`
    res.json(row)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── BLOG ──────────────────────────────────────────────────────────────────

app.get('/api/blog', async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 20)
    const offset = Number(req.query.offset ?? 0)
    const [{ total }] = await sql`SELECT COUNT(*)::int as total FROM blog`
    const rows = await sql`SELECT * FROM blog ORDER BY published_at DESC LIMIT ${limit} OFFSET ${offset}`
    res.json({ data: rows, total, limit, offset })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/blog', async (req, res) => {
  try {
    const d = req.body
    const [row] = await sql`
      INSERT INTO blog (titre, contenu, images, videos, published_at)
      VALUES (${d.titre}, ${d.contenu},
        ${JSON.stringify(d.images ?? [])}::jsonb, ${JSON.stringify(d.videos ?? [])}::jsonb,
        ${d.published_at ?? new Date().toISOString()})
      RETURNING *`
    res.json(row)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.put('/api/blog/:id', async (req, res) => {
  try {
    const d = req.body
    const [row] = await sql`
      UPDATE blog SET titre=${d.titre}, contenu=${d.contenu},
        images=${JSON.stringify(d.images ?? [])}::jsonb, videos=${JSON.stringify(d.videos ?? [])}::jsonb,
        published_at=${d.published_at}, updated_at=now()
      WHERE id=${req.params.id} RETURNING *`
    res.json(row)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/blog/:id', async (req, res) => {
  try {
    await sql`DELETE FROM blog WHERE id = ${req.params.id}`
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── USERS ─────────────────────────────────────────────────────────────────

app.get('/api/users', async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 50)
    const offset = Number(req.query.offset ?? 0)
    const rows = await sql`SELECT id, email, nom, prenom, created_at FROM users ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/users', async (req, res) => {
  try {
    const d = req.body
    const hashed = await bcrypt.hash(d.password, 10)
    const [row] = await sql`
      INSERT INTO users (email, nom, prenom, password)
      VALUES (${d.email}, ${d.nom}, ${d.prenom}, ${hashed})
      RETURNING id, email, nom, prenom, created_at`
    res.json(row)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.put('/api/users/:id', async (req, res) => {
  try {
    const d = req.body
    const hashed = await bcrypt.hash(d.password, 10)
    const [row] = await sql`
      UPDATE users SET email=${d.email}, nom=${d.nom}, prenom=${d.prenom}, password=${hashed}
      WHERE id=${req.params.id} RETURNING id, email, nom, prenom, created_at`
    res.json(row)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/users/:id', async (req, res) => {
  try {
    await sql`DELETE FROM users WHERE id = ${req.params.id}`
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Login avec bcrypt
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const [user] = await sql`SELECT id, nom, prenom, password FROM users WHERE email=${email}`
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    res.json({ id: user.id, nom: user.nom, prenom: user.prenom })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── COMMENTS ─────────────────────────────────────────────────────────────

app.get('/api/comments/:postId', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM comments WHERE post_id=${req.params.postId} ORDER BY created_at ASC`
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/comments', async (req, res) => {
  try {
    const { post_id, author_name, content } = req.body
    const [row] = await sql`
      INSERT INTO comments (post_id, author_name, content)
      VALUES (${post_id}, ${author_name}, ${content})
      RETURNING *`
    res.json(row)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/comments/:id', async (req, res) => {
  try {
    await sql`DELETE FROM comments WHERE id = ${req.params.id}`
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/blog/:id/stats', async (req, res) => {
  try {
    const [{ comments }] = await sql`SELECT COUNT(*)::int as comments FROM comments WHERE post_id=${req.params.id}`
    const [{ likes }] = await sql`SELECT COUNT(*)::int as likes FROM likes WHERE post_id=${req.params.id}`
    res.json({ comments, likes })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── LIKES ─────────────────────────────────────────────────────────────────

app.post('/api/likes', async (req, res) => {
  try {
    const { post_id, session_id } = req.body
    const existing = await sql`SELECT id FROM likes WHERE post_id=${post_id} AND session_id=${session_id}`
    if (existing.length > 0) {
      await sql`DELETE FROM likes WHERE post_id=${post_id} AND session_id=${session_id}`
      res.json({ liked: false })
    } else {
      await sql`INSERT INTO likes (post_id, session_id) VALUES (${post_id}, ${session_id})`
      res.json({ liked: true })
    }
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/likes/:postId/:sessionId', async (req, res) => {
  try {
    const rows = await sql`SELECT id FROM likes WHERE post_id=${req.params.postId} AND session_id=${req.params.sessionId}`
    res.json({ liked: rows.length > 0 })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── BOOKINGS ──────────────────────────────────────────────────────────────

app.get('/api/bookings', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC LIMIT 200`
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const { status } = req.body
    const [row] = await sql`
      UPDATE bookings SET status=${status}, updated_at=now()
      WHERE id=${req.params.id} RETURNING *`
    res.json(row)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

const PORT = process.env.PORT || 3002
const server = app.listen(PORT, () => console.log(`API server running on port ${server.address().port}`))
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} in use, trying ${Number(PORT) + 1}...`)
    server.listen(Number(PORT) + 1)
  }
})
