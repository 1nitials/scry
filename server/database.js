const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'chat.db'))

db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
    )
`)

const createConversation = (title) => {
    const stmt = db.prepare('INSERT INTO conversations (title, created_at) VALUES (?, ?)')
    const result = stmt.run(title, Date.now())
    return result.lastInsertRowid
}

const getConversations = () => {
    const stmt = db.prepare('SELECT * FROM conversations ORDER BY created_at DESC')
    return stmt.all()
}

const clearConversation = () => {
    const stmt = db.prepare('DELETE FROM conversations')
    return stmt.run()
}

const saveMessage = (conversation_id, type, content) => {
    const stmt = db.prepare('INSERT INTO messages (conversation_id, type, content, timestamp) VALUES (?, ?, ?, ?)')
    return stmt.run(conversation_id, type, content, Date.now())
}

const getMessages = (conversation_id) => {
    const stmt = db.prepare(`SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC`)
    return stmt.all(conversation_id)
}

const clearMessages = () => {
    const stmt = db.prepare('DELETE FROM messages')
    return stmt.run()
}

module.exports = {
    createConversation,
    clearConversation,
    getConversations,
    saveMessage,
    getMessages,
    clearMessages
}