package com.cehome.apimanager.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.cehome.apimanager.common.BaseController;
import com.cehome.apimanager.utils.ParamsUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/apimanager/params")
public class ParamsController extends BaseController {
    private static Logger logger = LoggerFactory.getLogger(ParamsController.class);

    /**
     * 参数列表导入
     *
     * @param map
     * @return
     */
    @RequestMapping(value = "convertJsonToRows", method = RequestMethod.POST)
    public Map<String, Object> convertJsonToRows(@RequestBody Map<String, Object> map) {
        try {
            JSONArray rows = new JSONArray();
            ParamsUtils.convertJsonToRows(new JSONObject(map), rows);
            return toSuccess(rows.toJSONString());
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return toFail(e.getMessage());
        }
    }
}
