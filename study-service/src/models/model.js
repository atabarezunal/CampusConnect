// Definimos la estructura "ideal" de un grupo de estudio
class StudyGroup {
    static validate(data) {
        const errors = [];
        if (!data.name || typeof data.name !== 'string') errors.push("El nombre es obligatorio");
        if (!data.id_subject) errors.push("El ID de la materia es obligatorio");
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    
    static format(data, userId) {
        return {
            name: data.name,
            id_subject: data.id_subject,
            description: data.description || "",
            created_by: userId,
            created_at: new Date().toISOString(),
            status: 'active'
        };
    }
}

module.exports = StudyGroup;