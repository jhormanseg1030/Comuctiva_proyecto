package com.ecomerce.security;

import com.ecomerce.model.Usuario;
import com.ecomerce.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String numeroDocumento) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findById(numeroDocumento)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + numeroDocumento));

        return UserDetailsImpl.build(usuario);
    }
}
