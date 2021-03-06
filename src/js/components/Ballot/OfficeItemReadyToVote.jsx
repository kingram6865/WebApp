import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import BallotItemSupportOpposeCountDisplay from '../Widgets/BallotItemSupportOpposeCountDisplay';
import { cordovaDot, historyPush } from '../../utils/cordovaUtils';
import { renderLog } from '../../utils/logging';
import VoterGuideStore from '../../stores/VoterGuideStore';
import SupportStore from '../../stores/SupportStore';
import { toTitleCase } from '../../utils/textFormat';
import { Wrapper, InnerWrapper, BioColumn, OfficeColumn, OfficeText, BioInformation, NameText, DescriptionText, HR, DesktopTabletView, MobileView } from './BallotItemReadyToVote';


class OfficeItemReadyToVote extends Component {
  static propTypes = {
    // ballot_item_display_name: PropTypes.string.isRequired,
    candidate_list: PropTypes.array,
    weVoteId: PropTypes.string,
  };

  constructor (props) {
    super(props);
    this.state = {
    };
    this.getOfficeLink = this.getOfficeLink.bind(this);
  }

  componentDidMount () {
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
    this.onVoterGuideStoreChange();
    this.supportStoreListener = SupportStore.addListener(this.onSupportStoreChange.bind(this));
    // console.log("OfficeItemCompressed, this.props.we_vote_id: ", this.props.we_vote_id);
  }

  componentWillUnmount () {
    this.voterGuideStoreListener.remove();
    this.supportStoreListener.remove();
  }

  onVoterGuideStoreChange () {
    // We just want to trigger a re-render
    this.setState();
  }

  onSupportStoreChange () {
    // We just want to trigger a re-render
    this.setState();
  }

  getOfficeLink () {
    return `/office/${this.props.weVoteId}/`;
  }

  render () {
    renderLog(__filename);
    const isSupportArray = [];
    let supportProps;
    let isSupport;

    // ballotItemDisplayName = capitalizeString(ballotItemDisplayName);

    this.props.candidate_list.forEach((candidate) => {
      supportProps = SupportStore.get(candidate.we_vote_id);
      if (supportProps) {
        isSupport = supportProps.is_support;

        if (isSupport) {
          isSupportArray.push(candidate.ballot_item_display_name);
        }
      }
    });

    /* This function finds the highest support count for each office but does not handle ties. If two candidates have the
    same network support count, only the first candidate will be displayed. */
    let largestSupportCount = 0;

    if (isSupportArray.length === 0) {
      let networkSupportCount;
      let networkOpposeCount;

      this.props.candidate_list.forEach((candidate) => {
        supportProps = SupportStore.get(candidate.we_vote_id);
        if (supportProps) {
          networkSupportCount = supportProps.support_count;
          networkOpposeCount = supportProps.oppose_count;

          if (networkSupportCount > networkOpposeCount) {
            if (networkSupportCount > largestSupportCount) {
              largestSupportCount = networkSupportCount;
            }
          }
        }
      });
    }
    return (
      <React.Fragment>
        <Wrapper onClick={() => historyPush(this.getOfficeLink())}>
          { this.props.candidate_list.map(oneCandidate => (
            <React.Fragment key={oneCandidate.we_vote_id}>
              { SupportStore.get(oneCandidate.we_vote_id) && SupportStore.get(oneCandidate.we_vote_id).is_support && (  // eslint-disable-line no-nested-ternary
                <InnerWrapper>
                  <BioColumn>
                    <Avatar src={cordovaDot(oneCandidate.candidate_photo_url_medium)} />
                    <BioInformation>
                      <NameText>{oneCandidate.ballot_item_display_name}</NameText>
                      <DesktopTabletView>
                        <DescriptionText>{toTitleCase(oneCandidate.party)}</DescriptionText>
                      </DesktopTabletView>
                      <MobileView>
                        <DescriptionText>{oneCandidate.contest_office_name}</DescriptionText>
                      </MobileView>
                    </BioInformation>
                  </BioColumn>
                  <OfficeColumn>
                    <DesktopTabletView>
                      <OfficeText>{oneCandidate.contest_office_name}</OfficeText>
                    </DesktopTabletView>
                    <BallotItemSupportOpposeCountDisplay ballotItemWeVoteId={oneCandidate.we_vote_id} />
                  </OfficeColumn>
                </InnerWrapper>
              )
              }
            </React.Fragment>
          ))
          }
        </Wrapper>
        <HR />
      </React.Fragment>
    );
  }
}

export default OfficeItemReadyToVote;
