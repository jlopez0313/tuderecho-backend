const express = require('express');
const { getTenantModel } = require('../models/Tenant');

const validarTenant = async (req, res=express.response, next) => {
    const name = req.header('x-tenant');

    try {
        if (!name) {
            return res.status(400).json({
                ok: false,
                errors: 'Not Tenant given'
            })
        }

        const TenantModel = await getTenantModel();
        const existe = await TenantModel.findOne({name});
        
        if (!existe) {
            // const tenant = new TenantModel({name});
            // await tenant.save();
            return res.status(400).json({
                ok: false,
                errors: 'Tenant Not Exists'
            })
        }

        req.tenant = name;

    } catch (error) {
        console.log( error );
        return res.status(500).json({
            ok: false,
            error
        })
    }

    next();
}

module.exports = { validarTenant }