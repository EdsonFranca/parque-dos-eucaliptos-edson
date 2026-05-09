import { describe, it, expect } from 'vitest'
import { cadastroSchema, loginSchema } from '../authSchema'

describe('authSchema', () => {
  describe('cadastroSchema', () => {
    describe('validação de email', () => {
      it('deve aceitar emails válidos', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org',
          'user123@test-domain.com',
          'simple@test.com'
        ]

        validEmails.forEach(email => {
          const result = cadastroSchema.safeParse({
            nome: 'Test User',
            email,
            senha: 'Test@123',
            confirmarSenha: 'Test@123',
            telefone: '11999999999',
            cpf: '12345678901',
            dataNascimento: '1990-01-01',
            endereco: {
              rua: 'Rua Teste',
              numero: '123',
              bairro: 'Bairro Teste',
              cidade: 'Cidade Teste',
              estado: 'SP',
              cep: '12345678'
            },
            termos: true
          })
          expect(result.success).toBe(true)
        })
      })

      it('deve rejeitar emails inválidos', () => {
        const invalidEmails = [
          'invalid-email',
          '@domain.com',
          'user@',
          'user..name@domain.com',
          'user@domain',
          'user name@domain.com',
          'user@domain..com',
          '',
          'user@domain.c'
        ]

        invalidEmails.forEach(email => {
          const result = cadastroSchema.safeParse({
            nome: 'Test User',
            email,
            senha: 'Test@123',
            confirmarSenha: 'Test@123',
            telefone: '11999999999',
            cpf: '12345678901',
            dataNascimento: '1990-01-01',
            endereco: {
              rua: 'Rua Teste',
              numero: '123',
              bairro: 'Bairro Teste',
              cidade: 'Cidade Teste',
              estado: 'SP',
              cep: '12345678'
            },
            termos: true
          })
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.issues[0].message).toContain('Email inválido')
          }
        })
      })

      it('deve aplicar trim e lowercase no email', () => {
        const result = cadastroSchema.safeParse({
          nome: 'Test User',
          email: 'TEST@EXAMPLE.COM',
          senha: 'Test@123',
          confirmarSenha: 'Test@123',
          telefone: '11999999999',
          cpf: '12345678901',
          dataNascimento: '1990-01-01',
          endereco: {
            rua: 'Rua Teste',
            numero: '123',
            bairro: 'Bairro Teste',
            cidade: 'Cidade Teste',
            estado: 'SP',
            cep: '12345678'
          },
          termos: true
        })

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.email).toBe('test@example.com')
        }
      })
    })

    describe('validação de senha', () => {
      it('deve aceitar senhas que atendem aos requisitos de complexidade', () => {
        const validPasswords = [
          'Test@123',
          'Password1!',
          'MySecure@9',
          'ComplexPass8@',
          'Strong&Pass7'
        ]

        validPasswords.forEach(senha => {
          const result = cadastroSchema.safeParse({
            nome: 'Test User',
            email: 'test@example.com',
            senha,
            confirmarSenha: senha,
            telefone: '11999999999',
            cpf: '12345678901',
            dataNascimento: '1990-01-01',
            endereco: {
              rua: 'Rua Teste',
              numero: '123',
              bairro: 'Bairro Teste',
              cidade: 'Cidade Teste',
              estado: 'SP',
              cep: '12345678'
            },
            termos: true
          })
          expect(result.success).toBe(true)
        })
      })

      it('deve rejeitar senhas que não atendem aos requisitos de complexidade', () => {
        const invalidPasswords = [
          'password', // sem maiúscula, número ou especial
          'Password', // sem número e especial
          'password1', // sem maiúscula e especial
          'PASSWORD1', // sem minúscula e especial
          'Password!', // sem número
          'Password1', // sem caractere especial
          'Pass1!', // muito curto (menos de 8)
          'test@123', // sem maiúscula
          'TEST@123', // sem minúscula
          'Test1234', // sem caractere especial
          'Test!!!!', // sem número
          '', // vazio
          '12345678', // apenas números
          'abcdefgh', // apenas letras
          'ABCDEFGH', // apenas maiúsculas
          '!@#$%^&*' // apenas especiais
        ]

        invalidPasswords.forEach(senha => {
          const result = cadastroSchema.safeParse({
            nome: 'Test User',
            email: 'test@example.com',
            senha,
            confirmarSenha: senha,
            telefone: '11999999999',
            cpf: '12345678901',
            dataNascimento: '1990-01-01',
            endereco: {
              rua: 'Rua Teste',
              numero: '123',
              bairro: 'Bairro Teste',
              cidade: 'Cidade Teste',
              estado: 'SP',
              cep: '12345678'
            },
            termos: true
          })
          expect(result.success).toBe(false)
        })
      })

      it('deve rejeitar senhas com menos de 8 caracteres', () => {
        const shortPasswords = [
          'Test@1',
          'Pass@2',
          'T@3',
          'Test1@'
        ]

        shortPasswords.forEach(senha => {
          const result = cadastroSchema.safeParse({
            nome: 'Test User',
            email: 'test@example.com',
            senha,
            confirmarSenha: senha,
            telefone: '11999999999',
            cpf: '12345678901',
            dataNascimento: '1990-01-01',
            endereco: {
              rua: 'Rua Teste',
              numero: '123',
              bairro: 'Bairro Teste',
              cidade: 'Cidade Teste',
              estado: 'SP',
              cep: '12345678'
            },
            termos: true
          })
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.issues[0].message).toContain('pelo menos 8 caracteres')
          }
        })
      })

      it('deve rejeitar senhas com mais de 128 caracteres', () => {
        const longPassword = 'Test@123' + 'a'.repeat(130)
        const result = cadastroSchema.safeParse({
          nome: 'Test User',
          email: 'test@example.com',
          senha: longPassword,
          confirmarSenha: longPassword,
          telefone: '11999999999',
          cpf: '12345678901',
          dataNascimento: '1990-01-01',
          endereco: {
            rua: 'Rua Teste',
            numero: '123',
            bairro: 'Bairro Teste',
            cidade: 'Cidade Teste',
            estado: 'SP',
            cep: '12345678'
          },
          termos: true
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('não pode ter mais de 128 caracteres')
        }
      })
    })

    describe('validação de nome', () => {
      it('deve aplicar trim no nome', () => {
        const result = cadastroSchema.safeParse({
          nome: '  Test User  ',
          email: 'test@example.com',
          senha: 'Test@123',
          confirmarSenha: 'Test@123',
          telefone: '11999999999',
          cpf: '12345678901',
          dataNascimento: '1990-01-01',
          endereco: {
            rua: 'Rua Teste',
            numero: '123',
            bairro: 'Bairro Teste',
            cidade: 'Cidade Teste',
            estado: 'SP',
            cep: '12345678'
          },
          termos: true
        })

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.nome).toBe('Test User')
        }
      })

      it('deve rejeitar nomes com caracteres especiais', () => {
        const invalidNames = [
          'Test123',
          'Test@User',
          'Test#User',
          'Test User123',
          'Test-User',
          'Test_User'
        ]

        invalidNames.forEach(nome => {
          const result = cadastroSchema.safeParse({
            nome,
            email: 'test@example.com',
            senha: 'Test@123',
            confirmarSenha: 'Test@123',
            telefone: '11999999999',
            cpf: '12345678901',
            dataNascimento: '1990-01-01',
            endereco: {
              rua: 'Rua Teste',
              numero: '123',
              bairro: 'Bairro Teste',
              cidade: 'Cidade Teste',
              estado: 'SP',
              cep: '12345678'
            },
            termos: true
          })
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.issues[0].message).toContain('apenas letras e espaços')
          }
        })
      })

      it('deve rejeitar nomes muito curtos', () => {
        const result = cadastroSchema.safeParse({
          nome: 'Jo',
          email: 'test@example.com',
          senha: 'Test@123',
          confirmarSenha: 'Test@123',
          telefone: '11999999999',
          cpf: '12345678901',
          dataNascimento: '1990-01-01',
          endereco: {
            rua: 'Rua Teste',
            numero: '123',
            bairro: 'Bairro Teste',
            cidade: 'Cidade Teste',
            estado: 'SP',
            cep: '12345678'
          },
          termos: true
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('pelo menos 3 caracteres')
        }
      })

      it('deve rejeitar nomes muito longos', () => {
        const longName = 'a'.repeat(101)
        const result = cadastroSchema.safeParse({
          nome: longName,
          email: 'test@example.com',
          senha: 'Test@123',
          confirmarSenha: 'Test@123',
          telefone: '11999999999',
          cpf: '12345678901',
          dataNascimento: '1990-01-01',
          endereco: {
            rua: 'Rua Teste',
            numero: '123',
            bairro: 'Bairro Teste',
            cidade: 'Cidade Teste',
            estado: 'SP',
            cep: '12345678'
          },
          termos: true
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('não pode ter mais de 100 caracteres')
        }
      })
    })

    describe('validação de confirmação de senha', () => {
      it('deve rejeitar senhas que não coincidem', () => {
        const result = cadastroSchema.safeParse({
          nome: 'Test User',
          email: 'test@example.com',
          senha: 'Test@123',
          confirmarSenha: 'Different@123',
          telefone: '11999999999',
          cpf: '12345678901',
          dataNascimento: '1990-01-01',
          endereco: {
            rua: 'Rua Teste',
            numero: '123',
            bairro: 'Bairro Teste',
            cidade: 'Cidade Teste',
            estado: 'SP',
            cep: '12345678'
          },
          termos: true
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Senhas não coincidem')
        }
      })

      it('deve aceitar senhas que coincidem', () => {
        const senha = 'Test@123'
        const result = cadastroSchema.safeParse({
          nome: 'Test User',
          email: 'test@example.com',
          senha,
          confirmarSenha: senha,
          telefone: '11999999999',
          cpf: '12345678901',
          dataNascimento: '1990-01-01',
          endereco: {
            rua: 'Rua Teste',
            numero: '123',
            bairro: 'Bairro Teste',
            cidade: 'Cidade Teste',
            estado: 'SP',
            cep: '12345678'
          },
          termos: true
        })

        expect(result.success).toBe(true)
      })
    })

    describe('validação de telefone', () => {
      it('deve aceitar telefones válidos', () => {
        const validPhones = [
          '11999999999',
          '21988887777',
          '11912345678',
          '21987654321'
        ]

        validPhones.forEach(telefone => {
          const result = cadastroSchema.safeParse({
            nome: 'Test User',
            email: 'test@example.com',
            senha: 'Test@123',
            confirmarSenha: 'Test@123',
            telefone,
            cpf: '12345678901',
            dataNascimento: '1990-01-01',
            endereco: {
              rua: 'Rua Teste',
              numero: '123',
              bairro: 'Bairro Teste',
              cidade: 'Cidade Teste',
              estado: 'SP',
              cep: '12345678'
            },
            termos: true
          })
          expect(result.success).toBe(true)
        })
      })

      it('deve rejeitar telefones muito curtos', () => {
        const result = cadastroSchema.safeParse({
          nome: 'Test User',
          email: 'test@example.com',
          senha: 'Test@123',
          confirmarSenha: 'Test@123',
          telefone: '119999999',
          cpf: '12345678901',
          dataNascimento: '1990-01-01',
          endereco: {
            rua: 'Rua Teste',
            numero: '123',
            bairro: 'Bairro Teste',
            cidade: 'Cidade Teste',
            estado: 'SP',
            cep: '12345678'
          },
          termos: true
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('pelo menos 10 caracteres')
        }
      })
    })
  })

  describe('loginSchema', () => {
    describe('validação de email', () => {
      it('deve aceitar emails válidos', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org'
        ]

        validEmails.forEach(email => {
          const result = loginSchema.safeParse({
            email,
            senha: 'Test@123'
          })
          expect(result.success).toBe(true)
        })
      })

      it('deve rejeitar emails inválidos', () => {
        const invalidEmails = [
          'invalid-email',
          '@domain.com',
          'user@',
          ''
        ]

        invalidEmails.forEach(email => {
          const result = loginSchema.safeParse({
            email,
            senha: 'Test@123'
          })
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.issues[0].message).toContain('Email inválido')
          }
        })
      })

      it('deve aplicar trim e lowercase no email', () => {
        const result = loginSchema.safeParse({
          email: 'TEST@EXAMPLE.COM',
          senha: 'Test@123'
        })

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.email).toBe('test@example.com')
        }
      })
    })

    describe('validação de senha', () => {
      it('deve aceitar senhas não vazias', () => {
        const validPasswords = [
          'Test@123',
          'password',
          '123',
          'a',
          'any password'
        ]

        validPasswords.forEach(senha => {
          const result = loginSchema.safeParse({
            email: 'test@example.com',
            senha
          })
          expect(result.success).toBe(true)
        })
      })

      it('deve rejeitar senhas vazias', () => {
        const result = loginSchema.safeParse({
          email: 'test@example.com',
          senha: ''
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('obrigatória')
        }
      })

      it('deve rejeitar senhas muito longas', () => {
        const longPassword = 'a'.repeat(129)
        const result = loginSchema.safeParse({
          email: 'test@example.com',
          senha: longPassword
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('não pode ter mais de 128 caracteres')
        }
      })
    })
  })

  describe('testes de trim em campos de texto', () => {
    it('deve aplicar trim em todos os campos de texto do cadastro', () => {
      const result = cadastroSchema.safeParse({
        nome: '  Test User  ',
        email: 'test@example.com',
        senha: 'Test@123',
        confirmarSenha: 'Test@123',
        telefone: '  11999999999  ',
        cpf: '12345678901',
        dataNascimento: '1990-01-01',
        endereco: {
          rua: 'Rua Teste',
          numero: '123',
          bairro: 'Bairro Teste',
          cidade: 'Cidade Teste',
          estado: 'SP',
          cep: '12345678'
        },
        termos: true
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nome).toBe('Test User')
        expect(result.data.telefone).toBe('11999999999')
      }
    })

    it('deve aplicar trim em todos os campos de texto do login', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        senha: 'Test@123'
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
        expect(result.data.senha).toBe('Test@123')
      }
    })
  })
})
