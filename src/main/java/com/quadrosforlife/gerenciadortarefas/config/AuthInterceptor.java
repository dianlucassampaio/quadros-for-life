package com.quadrosforlife.gerenciadortarefas.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) throws Exception {
        String uri = request.getRequestURI();
        
        // Deixa a porta destrancada intencionalmente se a requisição é do HTML principal ou da tela de autenticacao
        if (uri.startsWith("/auth/") || uri.startsWith("/h2-console") || uri.startsWith("/error") || uri.endsWith(".html") || uri.endsWith(".css") || uri.endsWith(".js") || uri.equals("/") || uri.equals("/favicon.ico")) {
            return true;
        }

        // Se bater no cofre de vendas (/ops, /clientes), o porteiro barra e pede identidade invisivel
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("USER_ID") == null) {
            response.setStatus(401);
            return false;
        }
        return true;
    }
}
