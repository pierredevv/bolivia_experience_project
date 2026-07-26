import 'package:flutter/material.dart';
import '../../../../config/colors.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Política de Privacidad'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Center(
              child: Container(
                width: 60,
                height: 60,
                decoration: const BoxDecoration(
                  color: AppColors.primary50,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.privacy_tip_outlined,
                  size: 30,
                  color: AppColors.primary700,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Center(
              child: Text(
                'BoliviaExperience',
                style: Theme.of(context).textTheme.titleLarge,
              ),
            ),
            Center(
              child: Text(
                'Última actualización: Julio 2026',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.neutral500,
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Introduction
            _buildSection(
              context,
              'Introducción',
              'En BoliviaExperience, valoramos y protegemos la privacidad de nuestros usuarios. '
              'Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y '
              'protegemos la información personal que nos proporcionas al utilizar nuestra '
              'aplicación móvil y servicios relacionados.',
            ),

            _buildSection(
              context,
              '1. Información que Recopilamos',
              'Podemos recopilar los siguientes tipos de información:\n\n'
              '• Información de registro: nombre, correo electrónico, contraseña y país de origen.\n'
              '• Información de perfil: foto de perfil, preferencias de idioma y configuración de la cuenta.\n'
              '• Contenido generado por el usuario: reseñas, calificaciones, comentarios y fotos que publiques.\n'
              '• Datos de ubicación: cuando autorizas el acceso, recopilamos tu ubicación actual para mostrarte '
              'lugares cercanos y funcionalidades basadas en tu posición.\n'
              '• Datos de uso: estadísticas de interacción con la aplicación, páginas visitadas, '
              'funcionalidades utilizadas y tiempo de sesión.\n'
              '• Información del dispositivo: modelo, sistema operativo, versión de la aplicación y '
              'identificadores únicos del dispositivo.',
            ),

            _buildSection(
              context,
              '2. Uso de la Información',
              'Utilizamos la información recopilada para:\n\n'
              '• Proporcionar y mejorar nuestros servicios de descubrimiento turístico.\n'
              '• Personalizar tu experiencia según tus preferencias e intereses.\n'
              '• Mostrar contenido relevante, incluyendo recomendaciones de lugares y eventos.\n'
              '• Facilitar la interacción con otros usuarios a través de reseñas y calificaciones.\n'
              '• Enviar notificaciones sobre eventos, promociones y actualizaciones de la plataforma.\n'
              '• Analizar el uso de la aplicación para mejorar la funcionalidad y experiencia del usuario.\n'
              '• Garantizar la seguridad y prevenir el fraude o uso indebido de la plataforma.',
            ),

            _buildSection(
              context,
              '3. Análisis y Mejora de Servicios',
              'BoliviaExperience realiza análisis estadísticos y de comportamiento para:\n\n'
              '• Evaluar la efectividad de las funcionalidades de la aplicación.\n'
              '• Identificar tendencias de uso y preferencias de los usuarios.\n'
              '• Desarrollar nuevas características y mejoras basadas en datos agregados.\n'
              '• Optimizar el rendimiento y la estabilidad de la plataforma.\n'
              '• Generar reportes internos de métricas de la aplicación.\n\n'
              'Estos análisis se realizan con datos anonimizados y agregados que no permiten '
              'la identificación individual de los usuarios.',
            ),

            _buildSection(
              context,
              '4. Compartición de Información',
              'No vendemos ni compartimos tu información personal con terceros, excepto en los siguientes casos:\n\n'
              '• Con tu consentimiento explícito.\n'
              '• Con proveedores de servicios que nos ayudan a operar la plataforma (hosting, análisis, notificaciones), '
              'quienes están obligados contractualmente a proteger tu información.\n'
              '• Cuando sea requerido por ley o para responder a procesos legales.\n'
              '• Para proteger los derechos, propiedad o seguridad de BoliviaExperience, nuestros usuarios o el público.\n\n'
              'Los datos de reseñas y calificaciones son visibles públicamente para otros usuarios de la plataforma.',
            ),

            _buildSection(
              context,
              '5. Seguridad de los Datos',
              'Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:\n\n'
              '• Cifrado de datos en tránsito (TLS/SSL) y en reposo.\n'
              '• Autenticación segura mediante tokens JWT.\n'
              '• Acceso restringido a la información personal por parte de nuestro equipo.\n'
              '• Monitoreo regular de sistemas para detectar vulnerabilidades.\n'
              '• Copias de seguridad periódicas y planes de recuperación ante desastres.',
            ),

            _buildSection(
              context,
              '6. Derechos del Usuario',
              'Tienes los siguientes derechos sobre tu información personal:\n\n'
              '• Acceso: Solicitar una copia de la información personal que tenemos sobre ti.\n'
              '• Rectificación: Solicitar la corrección de información inexacta o incompleta.\n'
              '• Eliminación: Solicitar la eliminación de tu cuenta y datos personales.\n'
              '• Portabilidad: Recibir tus datos en un formato estructurado y de uso común.\n'
              '• Oposición: Oponerte al procesamiento de tus datos para fines específicos.\n'
              '• Limitación: Solicitar la limitación del procesamiento de tus datos.\n\n'
              'Para ejercer estos derechos, contacta a nuestro equipo de privacidad.',
            ),

            _buildSection(
              context,
              '7. Cookies y Tecnologías de Rastreo',
              'Utilizamos cookies y tecnologías similares para:\n\n'
              '• Mantener tu sesión activa y recordar tus preferencias.\n'
              '• Analizar el uso de la aplicación y mejorar el rendimiento.\n'
              '• Personalizar el contenido y las recomendaciones.\n\n'
              'Puedes controlar el uso de cookies a través de la configuración de tu dispositivo.',
            ),

            _buildSection(
              context,
              '8. Menores de Edad',
              'BoliviaExperience no está dirigido a menores de 13 años. No recopilamos '
              'intencionalmente información personal de menores. Si descubrimos que hemos '
              'recopilado información de un menor, la eliminaremos de inmediato.',
            ),

            _buildSection(
              context,
              '9. Cambios en esta Política',
              'Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. '
              'Te notificaremos sobre cambios significativos a través de la aplicación o por correo electrónico. '
              'El uso continuado de la plataforma después de los cambios constituye tu aceptación de la política actualizada.',
            ),

            _buildSection(
              context,
              '10. Contacto',
              'Si tienes preguntas o inquietudes sobre esta Política de Privacidad o el manejo de '
              'tus datos personales, puedes contactarnos a través de:\n\n'
              '• Correo electrónico: privacidad@boliviaexperience.com\n'
              '• Plataforma: Sección de Contacto en la aplicación\n\n'
              'Nos comprometemos a responder a tus consultas en un plazo máximo de 30 días.',
            ),

            const SizedBox(height: 24),

            // Footer
            Center(
              child: Text(
                '© 2026 BoliviaExperience. Todos los derechos reservados.',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.neutral500,
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(BuildContext context, String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.primary700,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}
