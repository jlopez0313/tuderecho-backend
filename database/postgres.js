const { Sequelize } = require("sequelize");
const { DataTypes } = require("sequelize");
const { Client } = require("pg");

class TenantPostgresManager {
  constructor() {
    this.connections = new Map();
  }

  _buildConnectionString(tenant) {
    const connectionString = `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}`;
    const baseUrl = new URL(connectionString);

    baseUrl.pathname = `tenant_${tenant}`;
    return baseUrl.toString();
  }

  async createDatabaseIfNotExists(dbName) {
    const client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    try {
      await client.connect();
      const res = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName]
      );
      if (res.rowCount === 0) {
        await client.query(`CREATE DATABASE ${dbName}`);
        console.log(`Database "${dbName}" created successfully.`);
      } else {
        console.log(`Database "${dbName}" already exists.`);
      }
    } catch (err) {
      console.error("Error checking or creating database:", err);
    } finally {
      await client.end();
    }
  }

  async getConnection(tenant) {
    const dbName = `tenant_${tenant}`;

    // Si ya existe una conexión, retornarla
    if (this.connections.has(dbName)) {
      return this.connections.get(dbName);
    }

    try {
      const connectionString = this._buildConnectionString(tenant);

      const sequelizeInstance = new Sequelize(connectionString, {
        dialect: "postgres",
        logging: false,
        define: {
          // Configuraciones globales para modelos
          timestamps: true,
          underscored: true,
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      });

      // Autenticar y sincronizar
      await sequelizeInstance.authenticate();

      this.connections.set(dbName, sequelizeInstance);
      return sequelizeInstance;
    } catch (error) {
      console.error(`Error connecting to tenant database ${dbName}:`, error);
      throw new Error("Error al conectar a la base de datos del tenant");
    }
  }

  async getModel(tenant, modelName, modelDefinition, modelOptions) {
    const tenantConnection = await this.getConnection(tenant);

    // Verificar si el modelo ya existe
    if (tenantConnection.models[modelName]) {
      return tenantConnection.models[modelName];
    }

    // Crear modelo para el tenant específico
    const Model = tenantConnection.define(modelName, modelDefinition, {
      // Opciones adicionales de modelo si es necesario
      tableName: `${tenant}_${modelName.toLowerCase()}s`,
      ...modelOptions,
    });

    // Sincronizar modelo (crear tabla si no existe)
    await Model.sync({ alter: true });

    return Model;
  }

  async closeConnections() {
    for (const [dbName, connection] of this.connections) {
      try {
        await connection.close();
        console.log(`Closed connection for ${dbName}`);
        this.connections.delete(dbName);
      } catch (error) {
        console.error(`Error closing connection for ${dbName}:`, error);
      }
    }
  }

  // Método para manejar migraciones por tenant
  async runMigrations(tenant, migrations) {
    const sequelize = await this.getConnection(tenant);

    for (const migration of migrations) {
      await sequelize.query(migration);
    }
  }
}

const tenantPostgresManager = new TenantPostgresManager();

module.exports = {
  getTenantConnection: (tenant) => tenantPostgresManager.getConnection(tenant),
  getModel: (tenant, modelName, modelDefinition, modelOptions) =>
    tenantPostgresManager.getModel(
      tenant,
      modelName,
      modelDefinition,
      modelOptions
    ),
  closeConnections: () => tenantPostgresManager.closeConnections(),
  runTenantMigrations: (tenant, migrations) =>
    tenantPostgresManager.runMigrations(tenant, migrations),
};
