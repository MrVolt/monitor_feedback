package ch.fhnw.cere.orchestrator.services;


import ch.fhnw.cere.orchestrator.models.Parameter;

import java.util.List;


public interface ParameterService {
    public List<Parameter> findAll();
    public List<Parameter> findByLanguage(String language);
    public Parameter save(Parameter parameter);
    public Parameter find(long id);
    public List<Parameter> findByMechanismId(long mechanismId);
    public void delete(long id);
    public List<Parameter> findByMechanismIdAndLanguage(long mechanismId, String language);
}



