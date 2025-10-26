db = db.getSiblingDB('pdf_templates');

db.createUser({
  user: 'pdf_user',
  pwd: 'pdf_password',
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