package com.cehome.apimanager.service.impl;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.cehome.apimanager.common.Page;
import com.cehome.apimanager.model.dto.AmObjectFieldDescReqDto;
import com.cehome.apimanager.model.dto.SysDbQueryReqDto;
import com.cehome.apimanager.model.dto.SysDbReqDto;
import com.cehome.apimanager.model.dto.SysDbResDto;
import com.cehome.apimanager.model.po.AmObjectFieldDesc;
import com.cehome.apimanager.model.po.DbConfig;
import com.cehome.apimanager.service.IAmObjectFieldDescService;
import com.cehome.apimanager.service.IDbConfigService;
import com.cehome.apimanager.service.ISysDbService;
import com.cehome.apimanager.utils.DbUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Date;
import java.util.List;
import java.util.Objects;

@Service
public class SysDbServiceImpl implements ISysDbService {

    @Autowired
    private IAmObjectFieldDescService objectFieldDescService;

    @Autowired
    private IDbConfigService dbConfigService;

    @Override
    public Page<SysDbResDto> findTables(SysDbQueryReqDto sysDbQueryReqDto) {
        DbConfig dbConfig = dbConfigService.findByDbName(sysDbQueryReqDto.getDbName());
        List<SysDbResDto> tables = DbUtils.getTables(dbConfig, sysDbQueryReqDto.getTableName());
        Page<SysDbResDto> page = new Page<>();
        Integer pageIndex = sysDbQueryReqDto.getPageIndex();
        Integer pageSize = sysDbQueryReqDto.getPageSize();
        page.buildPageInfo(pageIndex, pageSize);
        Integer pageOffset = page.getPageOffset();
        Integer toIndex = pageOffset + page.getPageSize();
        if(toIndex >= tables.size()){
            toIndex = tables.size();
        }
        List<SysDbResDto> sysDbResDtos = tables.subList(page.getPageOffset(), toIndex);
        for(SysDbResDto sysDbResDto : sysDbResDtos){
            String tableName = sysDbResDto.getTableName();
            AmObjectFieldDesc objectFieldDesc = objectFieldDescService.findByTableName(tableName);
            if(Objects.isNull(objectFieldDesc)){
                sysDbResDto.setResultDesc("未生成");
            } else {
                sysDbResDto.setResultDesc("已生成");
            }
        }
        page.fillPage(sysDbResDtos, tables.size());
        return page;
    }

    public void makeObjectDesc1(SysDbReqDto sysDbReqDto) {
        DbConfig dbConfig = dbConfigService.findByDbName(sysDbReqDto.getDbName());
        List<SysDbResDto> sysDbResDtoList = DbUtils.getColumnsInfo(dbConfig, sysDbReqDto);
        JSONObject jsonObject = new JSONObject();
        for(SysDbResDto sysDbResDto : sysDbResDtoList){
            String columnName = sysDbResDto.getColumnName();
            if("id".equals(columnName)){
                continue;
            }
            String[] nameSplit = columnName.split("_");
            String fieldName = "";
            for(String split : nameSplit){
                if(StringUtils.isEmpty(fieldName)){
                    fieldName += split;
                } else {
                    fieldName += split.substring(0, 1).toUpperCase() + split.substring(1);
                }
            }
            jsonObject.put(fieldName, sysDbResDto.getColumnComment());
        }
        AmObjectFieldDescReqDto objectFieldDescReqDto = new AmObjectFieldDescReqDto();
        String tableName = sysDbReqDto.getTableName();
        String[] tableNameSplit = tableName.split("_");
        String className = "";
        for(String split : tableNameSplit){
            if(StringUtils.isEmpty(className)){
                className += split;
            } else {
                className += split.substring(0, 1).toUpperCase() + split.substring(1);
            }
        }
        objectFieldDescReqDto.setClassWholeName(sysDbReqDto.getDbName() + ":" + className);
        objectFieldDescReqDto.setTableName(tableName);
        objectFieldDescReqDto.setFieldDescValue(jsonObject.toJSONString());
        AmObjectFieldDesc objectFieldDesc = objectFieldDescService.findByClassWholeName(className);
        if(objectFieldDesc != null){
            objectFieldDescReqDto.setUpdateTime(new Date());
            objectFieldDescReqDto.setUpdateUser(sysDbReqDto.getOperateUser());
            objectFieldDescReqDto.setId(objectFieldDesc.getId());
            objectFieldDescService.update(objectFieldDescReqDto);
        } else {
            objectFieldDescReqDto.setCreateTime(new Date());
            objectFieldDescReqDto.setCreateUser(sysDbReqDto.getOperateUser());
            objectFieldDescService.add(objectFieldDescReqDto);
        }
    }

    @Override
    public void makeObjectDesc(SysDbReqDto sysDbReqDto) {
        DbConfig dbConfig = dbConfigService.findByDbName(sysDbReqDto.getDbName());
        List<SysDbResDto> sysDbResDtoList = DbUtils.getColumnsInfo(dbConfig, sysDbReqDto);
        JSONArray jsonArray = new JSONArray();
        JSONObject objectDesc = new JSONObject();
        for(SysDbResDto sysDbResDto : sysDbResDtoList){
            JSONObject jsonObject = new JSONObject();
            String columnName = sysDbResDto.getColumnName();
            String[] nameSplit = columnName.split("_");
            String fieldName = "";
            for(String split : nameSplit){
                if(StringUtils.isEmpty(fieldName)){
                    fieldName += split;
                } else {
                    fieldName += split.substring(0, 1).toUpperCase() + split.substring(1);
                }
            }
            jsonObject.put("name", fieldName);
            jsonObject.put("type", sysDbResDto.getColumnType());
            jsonObject.put("desc", sysDbResDto.getColumnComment());
            jsonObject.put("rule", "");
            jsonObject.put("required", 2);
            jsonArray.add(jsonObject);
            if(!"id".equalsIgnoreCase(columnName)){
                objectDesc.put(fieldName, sysDbResDto.getColumnComment());
            }
        }
        AmObjectFieldDescReqDto objectFieldDescReqDto = new AmObjectFieldDescReqDto();
        String tableName = sysDbReqDto.getTableName();
        String[] tableNameSplit = tableName.split("_");
        String className = "";
        for(String split : tableNameSplit){
            if(StringUtils.isEmpty(className)){
                className += split;
            } else {
                className += split.substring(0, 1).toUpperCase() + split.substring(1);
            }
        }
        objectFieldDescReqDto.setClassWholeName(sysDbReqDto.getDbName() + ":" + className);
        objectFieldDescReqDto.setTableName(tableName);
        objectFieldDescReqDto.setFieldDescValue(objectDesc.toJSONString());
        objectFieldDescReqDto.setFieldInfoValue(jsonArray.toJSONString());
        AmObjectFieldDesc objectFieldDesc = objectFieldDescService.findByClassWholeName(objectFieldDescReqDto.getClassWholeName());
        if(objectFieldDesc != null){
            objectFieldDescReqDto.setUpdateTime(new Date());
            objectFieldDescReqDto.setUpdateUser(sysDbReqDto.getOperateUser());
            objectFieldDescReqDto.setId(objectFieldDesc.getId());
            objectFieldDescService.update(objectFieldDescReqDto);
        } else {
            objectFieldDescReqDto.setCreateTime(new Date());
            objectFieldDescReqDto.setCreateUser(sysDbReqDto.getOperateUser());
            objectFieldDescService.add(objectFieldDescReqDto);
        }
    }
}
