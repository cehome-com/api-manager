package com.cehome.apimanager.controller;

import com.cehome.apimanager.common.BaseController;
import com.cehome.apimanager.common.Page;
import com.cehome.apimanager.model.dto.AmActionLoginQueryReqDto;
import com.cehome.apimanager.model.dto.AmActionLoginReqDto;
import com.cehome.apimanager.model.po.AmActionLogin;
import com.cehome.apimanager.model.po.AmUser;
import com.cehome.apimanager.service.IAmActionLoginService;
import com.cehome.apimanager.utils.WebUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/apimanager/actionlogin")
public class AmActionLoginController extends BaseController {
    private static Logger logger = LoggerFactory.getLogger(AmActionLoginController.class);

    @Autowired
    private IAmActionLoginService actionLoginService;

    /**
     * 认证处理
     *
     * @param dto
     * @return
     */
    @RequestMapping(value = "/authenticate")
    public Map<String, Object> authenticate(AmActionLoginReqDto dto) {
        try {
            actionLoginService.authenticate(dto);
            return toSuccess();
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return toFail(e.getMessage());
        }
    }

    /**
     * 获取认证接口列表
     *
     * @param dto
     * @return
     */
    @RequestMapping("/list")
    public Map<String, Object> list(AmActionLoginQueryReqDto dto) {
        try {
            List<AmActionLogin> list = actionLoginService.list(dto);
            return toSuccess(list);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return toFail(e.getMessage());
        }
    }

    /**
     * 保存认证接口信息
     *
     * @param dto
     * @return
     */
    @RequestMapping("add")
    public Map<String, Object> add(HttpSession session, AmActionLoginReqDto dto) {
        try {
            AmUser loginUser = WebUtils.getLoginUser(session);
            dto.setOperateUser(loginUser.getId());
            actionLoginService.add(dto);
            return toSuccess();
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return toFail(e.getMessage());
        }
    }

    /**
     * 更新接口认证信息
     *
     * @param dto
     * @return
     */
    @RequestMapping("update")
    public Map<String, Object> update(HttpSession session, AmActionLoginReqDto dto) {
        try {
            AmUser loginUser = WebUtils.getLoginUser(session);
            dto.setOperateUser(loginUser.getId());
            actionLoginService.update(dto);
            return toSuccess();
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return toFail(e.getMessage());
        }
    }

    /**
     * 分页查询接口认证列表
     *
     * @param dto
     * @return
     */
    @RequestMapping("findPage")
    public Map<String, Object> findPage(AmActionLoginQueryReqDto dto) {
        try {
            Page<AmActionLogin> page = actionLoginService.findPage(dto);
            return toSuccess(page);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return toFail(e.getMessage());
        }
    }

    /**
     * 根据主键id查询认证接口
     *
     * @param id
     * @return
     */
    @RequestMapping("findById")
    public Map<String, Object> findById(Integer id) {
        try {
            AmActionLogin env = actionLoginService.findById(id);
            return toSuccess(env);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return toFail(e.getMessage());
        }
    }

    /**
     * 删除认证接口
     *
     * @param dto
     * @return
     */
    @RequestMapping("delete")
    public Map<String, Object> delete(HttpSession session, AmActionLoginReqDto dto) {
        try {
            AmUser loginUser = WebUtils.getLoginUser(session);
            dto.setOperateUser(loginUser.getId());
            actionLoginService.delete(dto);
            return toSuccess();
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return toFail(e.getMessage());
        }
    }
}
