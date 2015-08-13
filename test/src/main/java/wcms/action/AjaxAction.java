package wcms.action;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import wcms.model.Member;
import wcms.service.MemberService;
 
@Controller
public class AjaxAction {
	@Autowired
	private MemberService memberService;    
    
	@ResponseBody
	@RequestMapping(value="/{id}/ajaxselect", method = RequestMethod.GET)
	public  Map< String, Object> ajaxSelect(@PathVariable("id") String id, Model model, Member member){
		Map< String, Object>  resultMap = new HashMap< String, Object> ();
		resultMap.put("id", "momo3355");
	     resultMap.put("name", "연순모");
		return resultMap;
		//return "user/tiles";     				
	}
	
	
	@ResponseBody
	@RequestMapping(value = "/test/json", method = RequestMethod.GET, produces="application/json")
	public List< Map< String, Object>> ajax_receiveJSON() {
   
		List< Map< String, Object>> list = new ArrayList< Map< String, Object>>(); 
		for(int i=0 ; i<3 ; i++) {    
			Map< String, Object> map = new HashMap< String, Object>();      
			map.put("id", "id"+i);   
			map.put("name", "name"+i);     
			list.add(map);  }    
		return list; 
		}
	
	
	@RequestMapping(value="/{id}/ajaxveiw", method = RequestMethod.GET)	
	public String  ajaxveiw(@PathVariable("id") String id, Model model, Member member){
		return "/template/ajax/ajax_list";
	}
     
}
 
