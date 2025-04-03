/// <reference types="cypress" />

describe('API Configuration', () => {
  it('should have correct API URL', () => {
    expect(Cypress.env('API_URL')).to.equal('https://maxh33.pythonanywhere.com/api/v1');
  });

  it('should have correct login endpoint', () => {
    expect(`${Cypress.env('API_URL')}/auth/login/`).to.equal('https://maxh33.pythonanywhere.com/api/v1/auth/login/');
  });

  it('should use PythonAnywhere API in production', () => {
    // Test the API endpoint directly without basic auth
    cy.request({
      url: 'https://maxh33.pythonanywhere.com/api/v1/auth/login/',
      failOnStatusCode: false,
      method: 'POST',
      body: {
        username: 'testuser',
        password: 'testpass'
      }
    }).then((response) => {
      // Verify the URL is correct
      expect(response.allRequestResponses[0]['Request URL']).to.include('maxh33.pythonanywhere.com')
      // Verify we get the expected 401 for invalid credentials
      expect(response.status).to.equal(401)
      // Verify the response contains the expected error message
      expect(response.body).to.have.property('detail')
    })
  })

  it('should verify API root endpoint is accessible', () => {
    cy.request({
      url: 'https://maxh33.pythonanywhere.com/api/',
      failOnStatusCode: false,
      method: 'GET'
    }).then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body).to.have.property('status', 'success')
      expect(response.body).to.have.property('endpoints')
    })
  })
}) 