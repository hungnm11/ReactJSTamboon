import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import fetch from 'isomorphic-fetch';

import { summaryDonations } from './helpers';

const Row = styled.div`
  &::after {
    content: "";
    clear: both;
    display: table;
  }
`;

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
`;

const Image = styled.img`
  width: 100%;
  height: auto;
`;

const P = styled.p`
  float: left;
  display: flex;
  padding-left: 10px;
`;

const FooterItem = styled.div`
  display: flex;
`;

const Column = styled.div`
  float: left;
  ${({ xs }) => (xs ? getWidthString(xs) : "width: 100%")};

  @media only screen and (min-width: 768px) {
    ${({ sm }) => sm && getWidthString(sm)};
  }

  @media only screen and (min-width: 992px) {
    ${({ md }) => md && getWidthString(md)};
  }

  @media only screen and (min-width: 1200px) {
    ${({ lg }) => lg && getWidthString(lg)};
  }
`;

const Card = styled.div`
  margin: 10px;
  background-color: #ffffff;
  margin: 12px 12px 6px 12px;
  padding: 0 0 10px 0;
  box-sizing: border-box;
  -webkit-box-shadow: -2px 2px 5px 0px rgba(179, 179, 179, 0.58);
  -moz-box-shadow: -2px 2px 5px 0px rgba(179, 179, 179, 0.58);
  box-shadow: -2px 2px 5px 0px rgba(179, 179, 179, 0.58);
  position: relative;
`;

const Button = styled.button`
  font-size: 1em;
  margin: 0.2em;
  padding: 10px 1em;
  border-radius: 3px;
  background-color: #ffffff;
  border: 1px solid #136bb5;
  color: #136bb5;
  align-self: center;
  margin-left: auto;
  margin-right: 10px;
`;

const Pay = styled.button`
  font-size: 1em;
  padding: 10px;
  border-radius: 3px;
  background-color: #ffffff;
  border: 1px solid #136bb5;
  color: #136bb5;
  align-self: center;
  margin-left: 10px;
`;

const Modal = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  background-color: rgba(255,255,255, .9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const Label = styled.label`
  float: left;
`;

export default connect((state) => state)(
  class App extends Component {
    constructor(props) {
      super();

      this.state = {
        charities: [],
        selectedAmount: 10,
        isDonate: false
      };
    }

    componentDidMount() {
      const self = this;
      fetch('http://localhost:3001/charities')
        .then(function (resp) { return resp.json(); })
        .then(function (data) {
          self.setState({ charities: data })
        });

      fetch('http://localhost:3001/payments')
        .then(function (resp) { return resp.json() })
        .then(function (data) {
          self.props.dispatch({
            type: 'UPDATE_TOTAL_DONATE',
            amount: summaryDonations(data.map((item) => (item.amount))),
          });
        })
    }

    render() {
      const self = this;
      const cards = this.state.charities.map(function (item, i) {
        const payments = [10, 20, 50, 100, 500].map((amount, j) => (
          <Label key={j}>
            <input
              type="radio"
              name="payment"
              onClick={function () {
                self.setState({ selectedAmount: amount })
              }} /> {amount}
          </Label>
        ));
        return (
          <Column key={i} xs="12" sm="6" md="6">
            <Card >
              <Image src="https://cdn.vaildaily.com/wp-content/uploads/sites/7/2016/09/CvrTrain-VDN-092816-1240x826.jpg" alt="" />
              <FooterItem>
                <P>{item.name}</P>
                <Button onClick={function () {
                  self.setState({ isDonate: item.id })
                }} >Donate</Button>
              </FooterItem>
              {self.state.isDonate === item.id && (<Modal>
                <p>Select the amount to donate (USD)</p>
              <P>{payments}</P>
              <Pay onClick={handlePay.call(self, item.id, self.state.selectedAmount, item.currency)}>Pay</Pay></Modal>)}
            </Card>
          </Column>
        );
      });

      const style = {
        color: 'red',
        margin: '1em 0',
        fontWeight: 'bold',
        fontSize: '16px',
        textAlign: 'center',
      };
      const donate = this.props.donate;
      const message = this.props.message;

      return (
        <div>
          <Title>Tamboon React</Title>
          <p>All donations: {donate}</p>
          <p style={style}>{message}</p>
          <Row>
            {cards}
          </Row>

        </div>
      );
    }
  }
);

function handlePay(id, amount, currency) {
  const self = this;
  return function () {
    fetch('http://localhost:3001/payments', {
      method: 'POST',
      body: `{ "charitiesId": ${id}, "amount": ${amount}, "currency": "${currency}" }`,
    })
      .then(function (resp) { return resp.json(); })
      .then(function () {
        self.props.dispatch({
          type: 'UPDATE_TOTAL_DONATE',
          amount,
        });
        self.props.dispatch({
          type: 'UPDATE_MESSAGE',
          message: `Thanks for donate ${amount}!`,
        });

        setTimeout(function () {
          self.props.dispatch({
            type: 'UPDATE_MESSAGE',
            message: '',
          });
        }, 2000);
      });
  }
}

function getWidthString(span) {
  if (!span) return;

  let width = span / 12 * 100;
  return `width: ${width}%;`;
}


