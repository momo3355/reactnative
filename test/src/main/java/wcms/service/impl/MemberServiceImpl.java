package wcms.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import wcms.dao.MemberDao;
import wcms.model.Member;
import wcms.service.MemberService;

@Service 
public class MemberServiceImpl implements MemberService {

	@Autowired
	private MemberDao memberDao;
	
	@Override
	public  Member SelectMember(Member member)  {
		return memberDao.SelectMember(member);
	}	
	
}
