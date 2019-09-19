package com.cehome.apimanager.service.impl;

import com.cehome.apimanager.cache.CacheProvider;
import com.cehome.apimanager.common.CommonMeta;
import com.cehome.apimanager.common.Page;
import com.cehome.apimanager.dao.AmProjectDao;
import com.cehome.apimanager.exception.BizValidationException;
import com.cehome.apimanager.model.dto.*;
import com.cehome.apimanager.model.po.AmModule;
import com.cehome.apimanager.model.po.AmProject;
import com.cehome.apimanager.service.IAmModuleService;
import com.cehome.apimanager.service.IAmOperateLogService;
import com.cehome.apimanager.service.IAmProjectService;
import com.cehome.apimanager.utils.CompareUtils;
import com.cehome.apimanager.utils.ThreadUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 项目业务接口实现
 * 
 * @author sunlei
 *
 */
@Service
public class AmProjectServiceImpl implements IAmProjectService {

	@Autowired
	private AmProjectDao projectDao;

	@Autowired
	private IAmModuleService moduleService;

	@Autowired
	private IAmOperateLogService operateLogService;

	@Autowired
	private CacheProvider cacheProvider;

	@Override
	public void add(AmProjectReqDto dto) {
		dto.setCreateTime(new Date());
		dto.setUpdateTime(new Date());
		dto.setCreateUser(dto.getOperateUser());
		dto.setUpdateUser(dto.getOperateUser());
		projectDao.add(dto);
		ThreadUtils.execute(new ThreadUtils.Task() {
			@Override
			public void doTask() {
				AmOperateLogReqDto operateLogReqDto = new AmOperateLogReqDto();
				operateLogReqDto.setModuleCode(CommonMeta.Module.PROJECT.getCode());
				operateLogReqDto.setOperateType(CommonMeta.OperateType.ADD.getCode());
				operateLogReqDto.setOperateDesc("增加项目【" + dto.getProjectName() + "】");
				operateLogReqDto.setOperateUser(dto.getOperateUser());
				operateLogReqDto.setEntityId(dto.getId());
				operateLogService.add(operateLogReqDto);
			}
		});
	}

	@Override
	public void update(AmProjectReqDto dto) {
		AmProject project = projectDao.get(dto.getId());
		dto.setUpdateTime(new Date());
		dto.setUpdateUser(dto.getOperateUser());
		projectDao.update(dto);
		ThreadUtils.execute(new ThreadUtils.Task() {
			@Override
			public void doTask() {
				AmOperateLogReqDto operateLogReqDto = new AmOperateLogReqDto();
				operateLogReqDto.setModuleCode(CommonMeta.Module.PROJECT.getCode());
				operateLogReqDto.setOperateType(CommonMeta.OperateType.UPDATE.getCode());
				operateLogReqDto.setOperateDesc("修改项目【" + dto.getProjectName() + "】");
				operateLogReqDto.setOperateUser(dto.getOperateUser());
				if(!project.equals(dto)){
					operateLogReqDto.setContentChange(CompareUtils.compareFieldDiff(project, dto));
				}
				operateLogReqDto.setEntityId(dto.getId());
				operateLogService.add(operateLogReqDto);
			}
		});
	}

	@Override
	public AmProjectResDto findById(Integer id) {
		AmProject amProject = projectDao.get(id);
		if(amProject == null){
			return null;
		}
		AmProjectResDto amProjectResDto = new AmProjectResDto();
		BeanUtils.copyProperties(amProject, amProjectResDto);
		return amProjectResDto;
	}

	@Override
	public void delete(AmProjectReqDto dto) {
		AmModuleQueryReqDto moduleQueryReqDto = new AmModuleQueryReqDto();
		moduleQueryReqDto.setProjectId(dto.getId());
		List<AmModule> moduleList = moduleService.list(moduleQueryReqDto);
		if(moduleList != null && !moduleList.isEmpty()){
			throw new BizValidationException("项目下存在其他模块，不能删除！");
		}
		AmProject project = projectDao.get(dto.getId());
		projectDao.delete(dto.getId());

		ThreadUtils.execute(new ThreadUtils.Task() {
			@Override
			public void doTask() {
				AmOperateLogReqDto operateLogReqDto = new AmOperateLogReqDto();
				operateLogReqDto.setModuleCode(CommonMeta.Module.PROJECT.getCode());
				operateLogReqDto.setOperateType(CommonMeta.OperateType.DELETE.getCode());
				operateLogReqDto.setOperateDesc("删除项目【" + project.getProjectName() + "】");
				operateLogReqDto.setOperateUser(dto.getOperateUser());
				operateLogReqDto.setEntityId(dto.getId());
				operateLogService.add(operateLogReqDto);
			}
		});
	}

	@Override
	public Page<AmProject> findPage(AmProjectQueryReqDto dto) {
		Page<AmProject> projectPage = projectDao.find(dto);
		List<AmProject> datas = projectPage.getDatas();
		if(CollectionUtils.isEmpty(datas)){
			return projectPage;
		}
		List<AmProject> result = new ArrayList<>();
		Map<String, String> userDicMap = cacheProvider.getUserDicMap();
		for(AmProject project : datas){
			AmProjectResDto projectResDto = new AmProjectResDto();
			BeanUtils.copyProperties(project, projectResDto);
			if(project.getCreateUser() != null){
				projectResDto.setCreateUserName(userDicMap.get(project.getCreateUser() + ""));
			}
			if(project.getUpdateUser() != null){
				projectResDto.setUpdateUserName(userDicMap.get(project.getUpdateUser() + ""));
			}
			result.add(projectResDto);
		}
		projectPage.setDatas(result);
		return projectPage;
	}
	
	@Override
	public List<AmProject> list(AmProjectQueryReqDto dto) {
		return projectDao.list(dto);
	}
}
