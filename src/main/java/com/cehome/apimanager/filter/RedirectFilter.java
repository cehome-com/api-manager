package com.cehome.apimanager.filter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Enumeration;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.apache.http.HttpEntity;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

import com.alibaba.fastjson.JSONObject;
import com.cehome.apimanager.common.CommonMeta;
import com.cehome.apimanager.model.dto.AmActionQueryReqDto;
import com.cehome.apimanager.model.dto.AmActionResDto;
import com.cehome.apimanager.service.IAmActionService;
import com.cehome.apimanager.utils.HttpUtils;
import com.cehome.apimanager.utils.MockUtils;

public class RedirectFilter implements Filter, ApplicationContextAware{
	private static final String CONTENT_TYPE = "application/json";
	private static final String ENCODING = "UTF-8";
	private ApplicationContext applicationContext;

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		HttpServletRequest httpRequest = (HttpServletRequest)request;
		StringBuffer requestURL = httpRequest.getRequestURL();
		if(requestURL.indexOf("/apimanager/") > 0){
			chain.doFilter(request, response);
			return;
		}
		
		IAmActionService actionService = applicationContext.getBean(IAmActionService.class);
		Integer actionId = actionService.findByRequestUrl(requestURL.toString());
		AmActionQueryReqDto dto = new AmActionQueryReqDto();
		dto.setId(actionId);
		AmActionResDto actionResDto = actionService.findById(dto);
		String responseText = "";
		if(actionResDto != null && actionResDto.getStatus() == CommonMeta.Status.DOING.getCode()){
			String responseMock = actionResDto.getResponseMock();
			responseText = MockUtils.buildMockData(responseMock);
		} else {
			JSONObject headers = new JSONObject();
			Enumeration<String> headerNames = httpRequest.getHeaderNames();
			while(headerNames.hasMoreElements()){
				String headerName = headerNames.nextElement();
				headers.put(headerName, httpRequest.getHeader(headerName));
			}
			HttpEntity responseEntity = null;
			String method = httpRequest.getMethod();
			if("GET".equals(method)){
				Enumeration<String> parameterNames = httpRequest.getParameterNames();
				JSONObject nameValuePair = new JSONObject();
				while(parameterNames.hasMoreElements()){
					String parameterName = parameterNames.nextElement();
					nameValuePair.put(parameterName, httpRequest.getParameter(parameterName));
				}
				HttpUtils httpUtils = HttpUtils.getInstance();
				responseEntity = httpUtils.execute(requestURL.toString(), null, nameValuePair);
			} else if("POST".equals(method)){
				BufferedReader reader = new BufferedReader(new InputStreamReader(httpRequest.getInputStream()));
				StringBuffer buffer = new StringBuffer();
				String line = "";
				while ((line = reader.readLine()) != null){
					buffer.append(line);
				}
				HttpUtils httpUtils = HttpUtils.getInstance();
				responseEntity = httpUtils.execute(requestURL.toString(), headers, buffer.toString());
			}
			responseText = EntityUtils.toString(responseEntity, ENCODING);
		}
		
		response.setContentType(CONTENT_TYPE);
		response.setCharacterEncoding(ENCODING);
		ServletOutputStream outputStream = response.getOutputStream();
		outputStream.write(responseText.getBytes());
		outputStream.flush();
		outputStream.close();
	}

	@Override
	public void init(FilterConfig arg0) throws ServletException {
		
	}
	
	@Override
	public void destroy() {
		
	}
	
	@Override
	public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
		this.applicationContext = applicationContext;
	}
}
