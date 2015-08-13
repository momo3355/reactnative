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
public class LogoutAction {
	@Autowired
	private MemberService memberService;    
    
												  
	@RequestMapping(value = "/{link}/loginoutAction", method = RequestMethod.POST)
	public String loginoutAction(@ModelAttribute("loginForm")  Member member, BindingResult bindingResult, @PathVariable("link") String id, HttpSession session, Model map)throws Exception  {
    	
		System.out.println("name==="+member.getId());
		System.out.println("pass==="+member.getPass());
		member = memberService.SelectMember(member);
		System.out.println(member.getEmail());
    	System.out.println("test");
    	session.setAttribute("loginmembe_eamil", member.getEmail());
        return "redirect:/wcms/user.do";
    }


     
}
 
