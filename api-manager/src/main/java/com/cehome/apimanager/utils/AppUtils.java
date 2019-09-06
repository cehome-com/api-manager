package com.cehome.apimanager.utils;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

@Component
public class AppUtils implements ApplicationContextAware{
	private static ApplicationContext applicationContext;
	
	@Override
	public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
		AppUtils.applicationContext = applicationContext;
	}

	public static <E> E getBean(Class<E> clazz){
		return applicationContext.getBean(clazz);
	}
}
