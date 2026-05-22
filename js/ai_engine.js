/**
 * AI Hydrogeology Specialist Engine — GeoWell Platform
 * Handles WQI (Water Quality Index) calculations, WHO classification,
 * Piezometric surface analysis, and predictive hydrogeochemical modeling.
 */

const AIHydroSpecialist = {
    currentStandard: 'WHO',

    // Standards Definitions
    allStandards: {
        WHO: {
            ph: { limit: 8.5, weight: 4 },
            tds: { limit: 1000, weight: 4 },
            ca: { limit: 75, weight: 3 },
            mg: { limit: 50, weight: 3 },
            na: { limit: 200, weight: 4 },
            k: { limit: 12, weight: 2 },
            cl: { limit: 250, weight: 5 },
            so4: { limit: 250, weight: 5 },
            hco3: { limit: 500, weight: 1 },
            no3: { limit: 45, weight: 5 }
        },
        Algerian: {
            ph: { limit: 9.0, weight: 4 },
            tds: { limit: 1500, weight: 4 },
            ca: { limit: 200, weight: 3 },
            mg: { limit: 150, weight: 3 },
            na: { limit: 200, weight: 4 },
            k: { limit: 12, weight: 2 },
            cl: { limit: 500, weight: 5 },
            so4: { limit: 400, weight: 5 },
            hco3: { limit: 600, weight: 1 },
            no3: { limit: 50, weight: 5 }
        }
    },

    /**
     * Set active standard
     */
    setStandard(type) {
        if (this.allStandards[type]) {
            this.currentStandard = type;
            return true;
        }
        return false;
    },

    get standards() {
        return this.allStandards[this.currentStandard];
    },

    /**
     * Calculate WQI for a set of wells
     */
    calculateWQI(well) {
        if (!well.chemical || !well.chemical.cations || !well.chemical.anions) return null;

        const cat = well.chemical.cations;
        const ani = well.chemical.anions;
        const phys = well.physical || {};
        const activeStd = this.standards;

        // Extract parameters
        const params = {
            ph: phys.ph || 7.0,
            tds: phys.tds || 500,
            ca: cat.Ca || 0,
            mg: cat.Mg || 0,
            na: cat.Na || 0,
            k: cat.K || 0,
            cl: ani.Cl || 0,
            so4: ani.SO4 || 0,
            hco3: ani.HCO3 || 0,
            no3: ani.NO3 || 0
        };

        let totalWeight = 0;
        let sumWiQi = 0;

        for (const [key, val] of Object.entries(params)) {
            const std = activeStd[key];
            if (!std) continue;

            const wi = std.weight;
            totalWeight += wi;

            let qi = 0;
            if (key === 'ph') {
                // For pH: q_i = [(V_actual - 7) / (V_standard - 7)] * 100
                qi = Math.abs((val - 7.0) / (std.limit - 7.0)) * 100;
            } else {
                // For others: q_i = (V_actual / V_standard) * 100
                qi = (val / std.limit) * 100;
            }

            sumWiQi += (wi * qi);
        }

        const wqiValue = sumWiQi / totalWeight;
        return {
            value: parseFloat(wqiValue.toFixed(2)),
            classification: this.getClassification(wqiValue),
            standard: this.currentStandard
        };
    },

    /**
     * Categorize water quality based on WQI value
     */
    getClassification(wqi) {
        if (wqi < 50) return { label: "Excellent", color: "#00ff9d", description: "Excellent water quality" };
        if (wqi < 100) return { label: "Good", color: "#00d4ff", description: "Good water quality" };
        if (wqi < 200) return { label: "Poor", color: "#ffbf00", description: "Poor water quality" };
        if (wqi < 300) return { label: "Very Poor", color: "#ff7f00", description: "Very poor water quality" };
        return { label: "Unsuitable", color: "#ff4757", description: "Water unsuitable for drinking" };
    },

    /**
     * Generate Predictive Alerts for the next 12 months
     */
    predictTrends(well) {
        const currentTDS = well.physical?.tds || 500;
        const currentWQI = this.calculateWQI(well)?.value || 50;
        
        const riskFactor = (currentWQI / 100) + (currentTDS / 2000);
        
        if (riskFactor > 2.5) {
            return {
                risk: "Critical",
                message: "High risk of salinization. Immediate management required.",
                color: "#ff4757"
            };
        } else if (riskFactor > 1.5) {
            return {
                risk: "Moderate",
                message: "Increasing TDS trends. Monitor salinity monthly.",
                color: "#ffbf00"
            };
        }
        return {
            risk: "Stable",
            message: "Water quality parameters show stability.",
            color: "#00ff9d"
        };
    },

    /**
     * Generate a Summary Report for selected wells
     */
    generateSummaryReport(wells) {
        if (!wells || wells.length === 0) return "No wells selected for analysis.";

        const reportData = wells.map(w => {
            const result = this.calculateWQI(w);
            const trend = this.predictTrends(w);
            return {
                id: w.id,
                name: w.name,
                wqi: result ? result.value : 'N/A',
                class: result ? result.classification.label : 'N/A',
                trend: trend.risk,
                recommendation: trend.message,
                standard: result ? result.standard : 'N/A'
            };
        });

        return reportData;
    },

    /**
     * Geospatial Analyst: Piezometric Surface & Gradient
     */
    analyzeGeospatial(wells) {
        if (!wells || wells.length < 3) return { error: "Minimum 3 wells required." };

        const heads = wells.map(w => w.staticLevel || 0);
        const maxH = Math.max(...heads);
        const minH = Math.min(...heads);
        
        const drawdownCount = wells.filter(w => (w.historicalLevel - w.staticLevel) > 5).length;
        const stressLevel = (drawdownCount / wells.length) * 100;

        return {
            averageHead: parseFloat((heads.reduce((a, b) => a + b, 0) / wells.length).toFixed(2)),
            maxDrawdown: parseFloat((maxH - minH).toFixed(2)),
            stressPercentage: stressLevel,
            status: stressLevel > 50 ? "Critical" : stressLevel > 20 ? "Warning" : "Stable",
            recommendation: stressLevel > 50 ? "Immediate pumping restrictions advised." : "Ongoing monitoring required."
        };
    }
};

window.AIHydroSpecialist = AIHydroSpecialist;
