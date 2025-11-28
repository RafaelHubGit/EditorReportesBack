db = db.getSiblingDB('pdf_templates');

db.createUser({
  user: 'admin',
  pwd: 'password123',
  roles: [
    {
      role: 'readWrite',
      db: 'pdf_templates'
    }
  ]
});

db.createCollection('templates');
db.createCollection('folders');

print('✅ MongoDB inicializado correctamente');