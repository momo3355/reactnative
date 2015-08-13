package wcms.action;


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

import wcms.model.Member;
import wcms.service.MemberService;
 
@Controller
public class LoginAction {
	@Autowired
	private MemberService memberService;    
    
     
	@RequestMapping(value="/{id}/login", method = RequestMethod.GET)	
	public String  login(@ModelAttribute("loginForm") Member member, @PathVariable("id") String id, Model model){
		System.out.println("loginsub==="+id);
		model.addAttribute("title", "테스트입니다.");
		
		return "/template/login/login";
		//return "user/tiles";     				
	}
	
												  
	@RequestMapping(value = "/{link}/loginAction", method = RequestMethod.POST)
	public String loginAction(@ModelAttribute("loginForm")  Member member, BindingResult bindingResult, @PathVariable("link") String id, HttpSession session, Model map)throws Exception  {
    	
		System.out.println("name==="+member.getId());
		System.out.println("pass==="+member.getPass());
		member = memberService.SelectMember(member);
		System.out.println(member.getEmail());
    	System.out.println("test");
    	session.setAttribute("loginmembe_eamil", member.getEmail());
        return "redirect:/ysm/hellow.do";
    }


     
}
 
