class StudyGroup {
    static validate(data) {
        const errors = [];
        if (!data.name) errors.push("Nombre requerido");
        if (!data.id_subject) errors.push("Materia requerida");
        return { isValid: errors.length === 0, errors };
    }

    static format(data) {
        return {
            name: data.name,
            id_subject: data.id_subject,
            description: data.description || ""
        };
    }
}
module.exports = StudyGroup;