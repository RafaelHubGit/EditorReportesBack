import { DataSource } from 'typeorm';
import { Plan } from '../entities/Plan.entity';
import { Feature } from '../entities/Feature.entity';
import { PlanEntitlement } from '../entities/PlanEntitlement.entity';

export const seedDatabase = async (dataSource: DataSource) => {
    const planRepo = dataSource.getRepository(Plan);
    const featureRepo = dataSource.getRepository(Feature);
    const entitlementRepo = dataSource.getRepository(PlanEntitlement);

    // 1. Definir Features
    const featuresData = [
        { code: 'doc_limit_prod', description: 'Documentos en producción (limpios)', data_type: 'int' },
        { code: 'doc_limit_dev', description: 'Documentos en dev (con marca de agua)', data_type: 'int' },
        { code: 'extra_doc_cost', description: 'Costo por PDF extra (solo Starter/Business)', data_type: 'float' },
        { code: 'template_limit', description: 'Límite de plantillas (-1 ilimitado)', data_type: 'int' },
        { code: 'max_gen_time', description: 'Max tiempo generación (seg)', data_type: 'int' },
        { code: 'retention_period', description: 'TTL del archivo (seg)', data_type: 'int' },
        { code: 'use_webhooks', description: 'Acceso a webhooks', data_type: 'bool' },
    ];

    for (const f of featuresData) {
        await featureRepo.upsert(f, ['code']);
    }

    // 2. Definir Planes (Precios Netos para que Stripe maneje el Tax)
    const plansData = [
        { name: 'Free', price: 0, currency: 'USD' },
        { name: 'Starter', price: 9.99, currency: 'USD' },
        { name: 'Pay-as-you-go', price: 20.00, currency: 'USD' },
        { name: 'Business', price: 49.99, currency: 'USD' },
    ];

    for (const p of plansData) {
        await planRepo.upsert(p, ['name']);
    }

    const allPlans = await planRepo.find();
    const allFeatures = await featureRepo.find();
    const getPlan = (name: string) => allPlans.find(p => p.name === name);
    const getFeat = (code: string) => allFeatures.find(f => f.code === code);

    // 3. Mapeo de Entitlements Final
    const entitlements = [
        // --- PLAN FREE (F) ---
        { plan: getPlan('Free'), feature: getFeat('doc_limit_prod'), value: '25' },
        { plan: getPlan('Free'), feature: getFeat('doc_limit_dev'), value: '1000' },
        { plan: getPlan('Free'), feature: getFeat('template_limit'), value: '1' },
        { plan: getPlan('Free'), feature: getFeat('max_gen_time'), value: '20' },
        { plan: getPlan('Free'), feature: getFeat('retention_period'), value: '600' },
        { plan: getPlan('Free'), feature: getFeat('use_webhooks'), value: 'false' },

        // --- PLAN STARTER (S) ---
        { plan: getPlan('Starter'), feature: getFeat('doc_limit_prod'), value: '1000' },
        { plan: getPlan('Starter'), feature: getFeat('doc_limit_dev'), value: '-1' },
        { plan: getPlan('Starter'), feature: getFeat('extra_doc_cost'), value: '0.10' },
        { plan: getPlan('Starter'), feature: getFeat('template_limit'), value: '-1' },
        { plan: getPlan('Starter'), feature: getFeat('max_gen_time'), value: '60' },
        { plan: getPlan('Starter'), feature: getFeat('retention_period'), value: '18000' },
        { plan: getPlan('Starter'), feature: getFeat('use_webhooks'), value: 'true' },

        // --- PLAN PAY-AS-YOU-GO (P) ---
        { plan: getPlan('Pay-as-you-go'), feature: getFeat('doc_limit_prod'), value: '1500' },
        { plan: getPlan('Pay-as-you-go'), feature: getFeat('doc_limit_dev'), value: '-1' },
        { plan: getPlan('Pay-as-you-go'), feature: getFeat('extra_doc_cost'), value: '0' },
        { plan: getPlan('Pay-as-you-go'), feature: getFeat('template_limit'), value: '-1' },
        { plan: getPlan('Pay-as-you-go'), feature: getFeat('max_gen_time'), value: '60' },
        { plan: getPlan('Pay-as-you-go'), feature: getFeat('retention_period'), value: '7200' },
        { plan: getPlan('Pay-as-you-go'), feature: getFeat('use_webhooks'), value: 'true' },

        // --- PLAN BUSINESS (B) ---
        { plan: getPlan('Business'), feature: getFeat('doc_limit_prod'), value: '7500' },
        { plan: getPlan('Business'), feature: getFeat('doc_limit_dev'), value: '-1' },
        { plan: getPlan('Business'), feature: getFeat('extra_doc_cost'), value: '0.05' },
        { plan: getPlan('Business'), feature: getFeat('template_limit'), value: '-1' },
        { plan: getPlan('Business'), feature: getFeat('max_gen_time'), value: '300' },
        { plan: getPlan('Business'), feature: getFeat('retention_period'), value: '86400' },
        { plan: getPlan('Business'), feature: getFeat('use_webhooks'), value: 'true' },
    ];

    for (const e of entitlements) {
        if (e.plan && e.feature) {
            const existing = await entitlementRepo.findOneBy({ 
                plan: { id: e.plan.id }, 
                feature: { id: e.feature.id } 
            });
            if (existing) {
                existing.value = e.value;
                await entitlementRepo.save(existing);
            } else {
                await entitlementRepo.save(e);
            }
        }
    }

    console.log('Seed completed! Your baby is ready to grow.');
};