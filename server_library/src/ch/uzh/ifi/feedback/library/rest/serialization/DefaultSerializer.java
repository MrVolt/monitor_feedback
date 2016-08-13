package ch.uzh.ifi.feedback.library.rest.serialization;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;


public abstract class DefaultSerializer<T> implements ISerializationService<T> {

	private Type serializationType;
	
	public DefaultSerializer() {
		setSerializationType();
	}
	
	@Override
	public String Serialize(T object) {
		
		Gson gson = new GsonBuilder().setPrettyPrinting().setDateFormat("yyyy-MM-dd hh:mm:ss.S").create();
		String json = gson.toJson(object);
		
		return json;
	}

	@Override
	public T Deserialize(String data) {
		
		Gson gson = new GsonBuilder().setPrettyPrinting().setDateFormat("yyyy-MM-dd hh:mm:ss.S").create();
		T requestObject = gson.fromJson(data, serializationType);

		return requestObject;
	}
	
	public abstract void SetNestedParameters(T object);
	
	private void setSerializationType()
	{
		Type superclass = this.getClass().getGenericSuperclass();
		serializationType = ((ParameterizedType)superclass).getActualTypeArguments()[0];
		
		while(superclass instanceof ParameterizedType)
		{
			superclass = ((ParameterizedType)superclass).getActualTypeArguments()[0];
		}
		
		//parameterType = (Class<?>)(superclass);
	}

}
