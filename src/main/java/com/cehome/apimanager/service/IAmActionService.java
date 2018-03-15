package com.cehome.apimanager.service;

import java.util.List;

import com.cehome.apimanager.common.Page;
import com.cehome.apimanager.model.dto.AmActionQueryReqDto;
import com.cehome.apimanager.model.dto.AmActionReqDto;
import com.cehome.apimanager.model.dto.AmActionResDto;
import com.cehome.apimanager.model.po.AmAction;

/**
 * 动作业务接口
 * 
 * @author sunlei
 *
 */
public interface IAmActionService {

	/**
	 * 添加接口文档
	 * 
	 * @param dto
	 */
	void add(AmActionReqDto dto);

	/**
	 * 更新接口文档
	 * 
	 * @param dto
	 */
	void update(AmActionReqDto dto);

	/**
	 * 根据id返回接口文档
	 * 
	 * @param dto
	 * @return
	 */
	AmActionResDto findById(AmActionQueryReqDto dto);
	
	/**
	 * 根据url匹配接口
	 * 
	 * @param dto
	 * @return
	 */
	Integer findByRequestUrl(String requestUrl);

	/**
	 * 根据id删除接口文档
	 * 
	 * @param dto
	 */
	void delete(AmActionReqDto dto);

	/**
	 * 分页查询接口文档列表
	 * 
	 * @param dto
	 * @return
	 */
	Page<AmAction> findPage(AmActionQueryReqDto dto);

	/**
	 * 查询接口文档列表
	 * 
	 * @param dto
	 * @return
	 */
	List<AmAction> list(AmActionQueryReqDto dto);

}
