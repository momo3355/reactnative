package wcms.aop;

import org.aspectj.lang.ProceedingJoinPoint;

public class ProfilingAdvice {
	public Object trace(ProceedingJoinPoint joinPoint) throws Throwable{
		String signatureString = joinPoint.getSignature().toShortString();
		System.out.println(signatureString + "main01테스트");
		long start = System.currentTimeMillis();
		
		try{
			Object result = joinPoint.proceed();
			return result;
		}finally{
			long finish = System.currentTimeMillis();
			System.out.println(signatureString + "파이날main01테스트");
			System.out.println(signatureString + "피니쉬main01테스트: " + (finish - start) + "ms");
		}
	}
}
