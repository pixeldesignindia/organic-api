// Note: The value 5000 is intentionally set as the highest value to avoid breaking the code in case of invalid data

const constants: any = {
    parameter: {
        male: {
            weight: {
                range: '',
                data: [
                    { start: 0, end: 0.80, result: 'Seriously Low' },
                    { start: 0.80, end: 0.90, result: 'Low' },
                    { start: 0.90, end: 1.10, result: 'Normal' },
                    { start: 1.10, end: 1.20, result: 'High' },
                    { start: 1.20, end: 5000, result: 'Seriously High' }
                ]
            },
            bmi: {
                range: '18.5-25',
                data: [
                    { start: 0, end: 18.5, result: 'Low' },
                    { start: 18.5, end: 25, result: 'Normal' },
                    { start: 25, end: 5000, result: 'High' }
                ]
            },
            body_fat: {
                range: '11-21',
                data: [
                    { start: 0, end: 21, result: 'Low' },
                    { start: 21, end: 30, result: 'Normal' },
                    { start: 31, end: 36, result: 'High' },
                    { start: 36, end: 5000, result: 'Seriously High' }
                ]
            },
            fat_free: null,
            subcutaneous_fat: {
                range: '8.6-16.7',
                data: [
                    { start: 0, end: 18.5, result: 'Low' },
                    { start: 18.5, end: 26.7, result: 'Normal' },
                    { start: 26.7, end: 5000, result: 'High' }
                ]
            },
            visceral_fat: {
                range: '<=9',
                data: [
                    { start: 0, end: 10, result: 'Normal' },
                    { start: 10, end: 15, result: 'High' },
                    { start: 15, end: 5000, result: 'Seriously High' }
                ]
            },
            body_water: {
                range: '55-65',
                data: [
                    { start: 0, end: 10, result: 'Adequate' },
                    { start: 10, end: 15, result: 'Normal' },
                    { start: 15, end: 5000, result: 'Seriously High' }
                ]
            },
            skeletal_muscle: {
                range: '49-59',
                data: [
                    { start: 0, end: 40, result: 'Low' },
                    { start: 40, end: 51, result: 'Normal' },
                    { start: 51, end: 5000, result: 'High' }
                ]
            },
            protein: {
                range: '16-18',
                data: [
                    { start: 0, end: 16, result: 'Low' },
                    { start: 16, end: 19, result: 'Normal' },
                    { start: 19, end: 5000, result: 'Adequate' }
                ]
            },
            bmr: {
                range: '>=result',
                data: [
                    { start: 16, end: 30, multiply_factor: 24 },
                    { start: 30, end: 50, multiply_factor: 22.3 },
                    { start: 50, end: 70, multiply_factor: 21.5 },
                    { start: 70, end: 5000, multiply_factor: 21.5 }
                ],
                results: [{
                    'ge': 'Normal'
                }, {
                    'lt': 'Not Upto Normal'
                }]
            },
            muscle_mass: {
                range: '',
                data: [
                    {
                        start: 0, end: 160, range: '38.5-46.5', data: [
                            { start: 0, end: 38.5, result: 'Low' },
                            { start: 38.5, end: 46.6, result: 'Normal' },
                            { start: 46.6, end: 5000, result: 'Adequate' }
                        ],
                    },
                    {
                        start: 160, end: 171, range: '44-52.4', data: [
                            { start: 0, end: 44, result: 'Low' },
                            { start: 44, end: 52.5, result: 'Normal' },
                            { start: 52.5, end: 5000, result: 'Adequate' }
                        ],
                    },
                    {
                        start: 171, end: 200, range: '49.4-59.4', data: [
                            { start: 0, end: 49.4, result: 'Low' },
                            { start: 49.4, end: 59.5, result: 'Normal' },
                            { start: 59.5, end: 5000, result: 'Adequate' }
                        ],
                    }
                ]
            },
            bone_mass: {
                range: '',
                is_range_formula: true,
                data: [
                    {
                        start: 0, end: 60, range: '2.3-2.7', data: [
                            { start: 0, end: 2.3, result: 'Low' },
                            { start: 2.3, end: 2.8, result: 'Normal' },
                            { start: 2.8, end: 5000, result: 'High' }
                        ],
                    },
                    {
                        start: 60, end: 76, range: '2.7-3.1', data: [
                            { start: 0, end: 2.7, result: 'Low' },
                            { start: 2.7, end: 3.2, result: 'Normal' },
                            { start: 3.2, end: 5000, result: 'High' }
                        ],
                    },
                    {
                        start: 76, end: 200, range: '3.0-3.4', data: [
                            { start: 0, end: 3.0, result: 'Low' },
                            { start: 3.0, end: 3.5, result: 'Normal' },
                            { start: 3.5, end: 5000, result: 'High' }
                        ],
                    }
                ]
            },
            body_temperature: {
                range: '96-99',
                data: [
                    { start: 0, end: 96, result: 'Low' },
                    { start: 96, end: 100, result: 'Normal' },
                    { start: 100, end: 110, result: 'High' },
                    { start: 110, end: 5000, result: 'Invalid' }
                ]
            },
            blood_pressure_systolic: {
                range: '90-139',
                data: [
                    { start: 0, end: 90, result: 'Low' },
                    { start: 90, end: 140, result: 'Normal' },
                    { start: 140, end: 5000, result: 'High' }
                ]
            },
            blood_pressure_diastolic: {
                range: '60-89',
                data: [
                    { start: 0, end: 60, result: 'Low' },
                    { start: 60, end: 90, result: 'Normal' },
                    { start: 90, end: 5000, result: 'High' }
                ]
            },
            oxygen: {
                range: '>=94',
                data: [
                    { start: 0, end: 94, result: 'Low' },
                    { start: 94, end: 101, result: 'Normal' },
                    { start: 101, end: 5000, result: 'Invalid' }
                ]
            },
            pulse: {
                range: '60-100',
                data: [
                    { start: 0, end: 60, result: 'Low' },
                    { start: 60, end: 101, result: 'Normal' },
                    { start: 101, end: 5000, result: 'High' }
                ]
            },
            blood_sugar: {
                range: '70-125',
                data: [
                    { start: 0, end: 70, result: 'Low' },
                    { start: 70, end: 126, result: 'Normal' },
                    { start: 126, end: 141, result: 'Pre-Diabetic' },
                    { start: 141, end: 5000, result: 'Diabetic' }
                ]
            },
            hemoglobin: {
                range: '12-17',
                data: [
                    { start: 0, end: 12, result: 'Low' },
                    { start: 12, end: 16, result: 'Normal' },
                    { start: 16, end: 5000, result: 'High' }
                ]
            }
        },
        female: {
            weight: {
                range: '',
                data: [
                    { start: 0, end: 0.80, result: 'Seriously Low' },
                    { start: 0.80, end: 0.90, result: 'Low' },
                    { start: 0.90, end: 1.10, result: 'Normal' },
                    { start: 1.10, end: 1.20, result: 'High' },
                    { start: 1.20, end: 5000, result: 'Seriously High' },
                ]
            },
            bmi: {
                range: '18.5-25',
                data: [
                    { start: 0, end: 18.5, result: 'Low' },
                    { start: 18.5, end: 25, result: 'Normal' },
                    { start: 25, end: 5000, result: 'High' }
                ]
            },
            body_fat: {
                range: '21-30',
                data: [
                    { start: 0, end: 21, result: 'Low' },
                    { start: 21, end: 30, result: 'Normal' },
                    { start: 31, end: 36, result: 'High' },
                    { start: 36, end: 5000, result: 'Seriously High' }
                ]
            },
            fat_free: null,
            subcutaneous_fat: {
                range: '18.5-26.7',
                data: [
                    { start: 0, end: 18.5, result: 'Low' },
                    { start: 18.5, end: 26.7, result: 'Normal' },
                    { start: 26.7, end: 5000, result: 'High' }
                ]
            },
            visceral_fat: {
                range: '<=9',
                data: [
                    { start: 0, end: 10, result: 'Normal' },
                    { start: 10, end: 15, result: 'High' },
                    { start: 15, end: 5000, result: 'Seriously High' }
                ]
            },
            body_water: {
                range: '45-60',
                data: [
                    { start: 0, end: 10, result: 'Adequate' },
                    { start: 10, end: 15, result: 'Normal' },
                    { start: 15, end: 5000, result: 'Seriously High' }
                ]
            },
            skeletal_muscle: {
                range: '40-50',
                data: [
                    { start: 0, end: 40, result: 'Low' },
                    { start: 40, end: 51, result: 'Normal' },
                    { start: 51, end: 5000, result: 'High' }
                ]
            },
            protein: {
                range: '',
                data: [
                    { start: 0, end: 16, result: 'Low' },
                    { start: 16, end: 19, result: 'Normal' },
                    { start: 19, end: 5000, result: 'Adequate' }
                ]
            },
            bmr: {
                range: '>=result',
                data: [
                    { start: 16, end: 30, multiply_factor: 24 },
                    { start: 30, end: 50, multiply_factor: 22.3 },
                    { start: 50, end: 70, multiply_factor: 21.5 },
                    { start: 70, end: 5000, multiply_factor: 21.5 }
                ]
            },
            meta_age: {
                range: null,
                replace_value: true,
                data: [
                    { start: 0, end: 'value', result: 'Normal' },
                    { start: 'value', end: 5000, result: 'Not Upto Normal' }
                ]
            },
            muscle_mass: {
                range: '',
                data: [
                    {
                        start: 0, end: 150, range: '29.1-34.7', data: [
                            { start: 0, end: 38.5, result: 'Low' },
                            { start: 38.5, end: 46.6, result: 'Normal' },
                            { start: 46.6, end: 5000, result: 'Adequate' }
                        ],
                    },
                    {
                        start: 150, end: 161, range: '32.9-37.5', data: [
                            { start: 0, end: 44, result: 'Low' },
                            { start: 44, end: 52.5, result: 'Normal' },
                            { start: 52.5, end: 5000, result: 'Adequate' }
                        ],
                    },
                    {
                        start: 161, end: 200, range: '36.5-42.5', data: [
                            { start: 0, end: 49.4, result: 'Low' },
                            { start: 49.4, end: 59.5, result: 'Normal' },
                            { start: 59.5, end: 5000, result: 'Adequate' }
                        ],
                    }
                ]
            },
            bone_mass: {
                range: '',
                data: [
                    {
                        start: 0, end: 45, range: '1.6-2.0', data: [
                            { start: 0, end: 2.3, result: 'Low' },
                            { start: 2.3, end: 2.8, result: 'Normal' },
                            { start: 2.8, end: 5000, result: 'High' }
                        ],
                    },
                    {
                        start: 46, end: 61, range: '2.0-2.4', data: [
                            { start: 0, end: 2.7, result: 'Low' },
                            { start: 2.7, end: 3.2, result: 'Normal' },
                            { start: 3.2, end: 5000, result: 'High' }
                        ],
                    },
                    {
                        start: 61, end: 200, range: '2.3-2.7', data: [
                            { start: 0, end: 3.0, result: 'Low' },
                            { start: 3.0, end: 3.5, result: 'Normal' },
                            { start: 3.5, end: 5000, result: 'High' }
                        ],
                    }
                ]
            },
            body_temperature: {
                range: '96-99',
                data: [
                    { start: 0, end: 96, result: 'Low' },
                    { start: 96, end: 100, result: 'Normal' },
                    { start: 100, end: 5000, result: 'High' }
                ]
            },
            blood_pressure_systolic: {
                range: '90-139',
                data: [
                    { start: 0, end: 90, result: 'Low' },
                    { start: 90, end: 140, result: 'Normal' },
                    { start: 140, end: 5000, result: 'High' }
                ]
            },
            blood_pressure_diastolic: {
                range: '60-89',
                data: [
                    { start: 0, end: 60, result: 'Low' },
                    { start: 60, end: 90, result: 'Normal' },
                    { start: 90, end: 5000, result: 'High' }
                ]
            },
            oxygen: {
                range: '>=94',
                data: [
                    { start: 0, end: 94, result: 'Low' },
                    { start: 94, end: 101, result: 'Normal' },
                    { start: 101, end: 5000, result: 'Invalid' }
                ]
            },
            pulse: {
                range: '60-100',
                data: [
                    { start: 0, end: 60, result: 'Low' },
                    { start: 60, end: 101, result: 'Normal' },
                    { start: 101, end: 5000, result: 'High' }
                ]
            },
            blood_sugar: {
                range: '70-125',
                data: [
                    { start: 0, end: 70, result: 'Low' },
                    { start: 70, end: 126, result: 'Normal' },
                    { start: 126, end: 141, result: 'Pre-Diabetic' },
                    { start: 141, end: 5000, result: 'Diabetic' }
                ]
            },
            hemoglobin: {
                range: '11-16',
                data: [
                    { start: 0, end: 12, result: 'Low' },
                    { start: 12, end: 16, result: 'Normal' },
                    { start: 16, end: 5000, result: 'High' }
                ]
            }
        }
    },

    hba1c: {
        male: {
            hba1c: {
                range: '< 5.7 %',
                data: [
                    { start: 0, end: 5.7, result: 'Normal' },
                    { start: 5.7, end: 6.5, result: 'Prediabetic' },
                    { start: 6.5, end: 5000, result: 'Diabetic' }
                ]
            }
        },
        female: {
            hba1c: {
                range: '< 5.7 %',
                data: [
                    { start: 0, end: 5.7, result: 'Normal' },
                    { start: 5.7, end: 6.5, result: 'Prediabetic' },
                    { start: 6.5, end: 5000, result: 'Diabetic' }
                ]
            }
        }
    },

    lipid: {
        male: {
            tc: {
                range: '<200',
                data: [
                    { start: 0, end: 200, result: 'Desirable' },
                    { start: 200, end: 240, result: 'Borderline High' },
                    { start: 240, end: 5000, result: 'High' }
                ]
            },
            tg: {
                range: '<150',
                data: [
                    { start: 0, end: 150, result: 'Desirable' },
                    { start: 150, end: 200, result: 'Borderline' },
                    { start: 200, end: 500, result: 'High' },
                    { start: 500, end: 5000, result: 'Very High' }
                ]
            },
            hdl: {
                range: '40-60',
                data: [
                    { start: 0, end: 40, result: 'Desirable' },
                    { start: 40, end: 61, result: 'Borderline High' },
                    { start: 61, end: 5000, result: 'High' }
                ]
            },
            ldl: {
                range: '<100',
                data: [
                    { start: 0, end: 100, result: 'Optimal' },
                    { start: 100, end: 130, result: 'Near Optimal' },
                    { start: 130, end: 160, result: 'Borderline High' },
                    { start: 160, end: 190, result: 'High' },
                    { start: 190, end: 5000, result: 'Very High' }
                ]
            },
            tc_hdl: {
                range: '3.3-4.4',
                data: [
                    { start: 0, end: 3.3, result: 'Low' },
                    { start: 3.3, end: 4.5, result: 'Normal' },
                    { start: 4.5, end: 5000, result: 'High' }
                ]
            }
        },
        female: {
            tc: {
                range: '<200',
                data: [
                    { start: 0, end: 200, result: 'Desirable' },
                    { start: 200, end: 240, result: 'Borderline High' },
                    { start: 240, end: 5000, result: 'High' }
                ]
            },
            tg: {
                range: '<150',
                data: [
                    { start: 0, end: 150, result: 'Desirable' },
                    { start: 150, end: 200, result: 'Borderline' },
                    { start: 200, end: 500, result: 'High' },
                    { start: 500, end: 5000, result: 'Very High' }
                ]
            },
            hdl: {
                range: '40-60',
                data: [
                    { start: 0, end: 40, result: 'Desirable' },
                    { start: 40, end: 61, result: 'Borderline High' },
                    { start: 61, end: 5000, result: 'High' }
                ]
            },
            ldl: {
                range: '<100',
                data: [
                    { start: 0, end: 100, result: 'Optimal' },
                    { start: 100, end: 130, result: 'Near Optimal' },
                    { start: 130, end: 160, result: 'Borderline High' },
                    { start: 160, end: 190, result: 'High' },
                    { start: 190, end: 5000, result: 'Very High' }
                ]
            },
            tc_hdl: {
                range: '3.3-4.4',
                data: [
                    { start: 0, end: 3.3, result: 'Low' },
                    { start: 3.3, end: 4.5, result: 'Normal' },
                    { start: 4.5, end: 5000, result: 'High' }
                ]
            }
        }
    }
};

export default constants;